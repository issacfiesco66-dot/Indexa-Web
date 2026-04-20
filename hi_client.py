"""
Cliente HTTP hacia la API de Historias Infinitas.

Usado por scraper_funerarias.py y otros scripts para:
  - ingestar leads de funerarias (POST /api/leads/funeraria)
  - marcar opt-outs (POST /api/leads/funeraria/optout)
  - consultar blocklist antes de enviar (GET /api/leads/funeraria/optouts)

Config vía env (.env.local en la raíz de Indexa):
  HI_API_BASE_URL    - https://historias-infinitas.com  (o http://localhost:3000 en dev)
  HI_INDEXA_API_KEY  - misma key que INDEXA_API_KEY del lado de HI
"""

from __future__ import annotations

import os
from typing import Any

import requests


class HIClientError(Exception):
    """Error al comunicarse con HI."""


class HIClient:
    """Wrapper ligero sobre los endpoints de HI."""

    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout: float = 20.0,
    ):
        self.base_url = (base_url or os.getenv("HI_API_BASE_URL") or "").rstrip("/")
        self.api_key = api_key or os.getenv("HI_INDEXA_API_KEY") or ""
        self.timeout = timeout
        if not self.base_url:
            raise HIClientError("HI_API_BASE_URL no configurada en .env.local")
        if not self.api_key or len(self.api_key) < 16:
            raise HIClientError("HI_INDEXA_API_KEY faltante o muy corta (mín 16 chars)")

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-Indexa-Key": self.api_key,
        }

    # ── Blocklist ───────────────────────────────────────────
    def fetch_optouts(self, since_iso: str | None = None) -> set[str]:
        """
        Devuelve set de teléfonos con status='opted_out' en HI.
        Úsalo para filtrar tu lista antes de enviar WhatsApp.
        """
        url = f"{self.base_url}/api/leads/funeraria/optouts"
        params = {"since": since_iso} if since_iso else None
        try:
            res = requests.get(url, headers=self._headers, params=params, timeout=self.timeout)
        except requests.RequestException as e:
            raise HIClientError(f"Error de red consultando optouts: {e}")
        if res.status_code == 401:
            raise HIClientError("401 unauthorized consultando optouts — revisa HI_INDEXA_API_KEY")
        if res.status_code != 200:
            raise HIClientError(f"GET /optouts falló: {res.status_code} {res.text[:200]}")
        data = res.json()
        return set(data.get("phones", []))

    # ── Ingest lead ──────────────────────────────────────────
    def ingest_lead(
        self,
        business_name: str,
        phone: str,
        vertical: str | None = None,
        city: str | None = None,
        state: str | None = None,
        google_place_id: str | None = None,
        notes: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Registra un lead en HI. Devuelve dict con:
          { ok, is_new, status, lead_id, token, link }

        Respuestas especiales (no lanzan excepción):
          - 403 opted_out          → { ok: False, opted_out: True }
          - 409 already_in_funnel  → datos + { ok: False, already: True }
        """
        url = f"{self.base_url}/api/leads/funeraria"
        payload: dict[str, Any] = {
            "business_name": business_name,
            "phone": phone,
        }
        if vertical: payload["vertical"] = vertical
        if city: payload["city"] = city
        if state: payload["state"] = state
        if google_place_id: payload["google_place_id"] = google_place_id
        if notes: payload["notes"] = notes
        if metadata: payload["metadata"] = metadata

        try:
            res = requests.post(url, headers=self._headers, json=payload, timeout=self.timeout)
        except requests.RequestException as e:
            raise HIClientError(f"Error de red en ingest: {e}")

        if res.status_code == 401:
            raise HIClientError("401 unauthorized en ingest — revisa HI_INDEXA_API_KEY")
        if res.status_code == 403:
            return {"ok": False, "opted_out": True, "phone": phone}
        if res.status_code == 409:
            data = res.json()
            data["ok"] = False
            data["already"] = True
            return data
        if res.status_code == 200:
            return res.json()
        raise HIClientError(
            f"POST /leads/funeraria falló: {res.status_code} {res.text[:300]}"
        )

    # ── Marcar opt-out ───────────────────────────────────────
    def mark_optout(self, phone: str, reason: str | None = None) -> dict[str, Any]:
        """Llama HI /optout para marcar un teléfono como no-contactable."""
        url = f"{self.base_url}/api/leads/funeraria/optout"
        payload: dict[str, Any] = {"phone": phone}
        if reason:
            payload["reason"] = reason
        try:
            res = requests.post(url, headers=self._headers, json=payload, timeout=self.timeout)
        except requests.RequestException as e:
            raise HIClientError(f"Error de red en optout: {e}")
        if res.status_code == 401:
            raise HIClientError("401 unauthorized en optout")
        if res.status_code == 200:
            return res.json()
        raise HIClientError(f"POST /optout falló: {res.status_code} {res.text[:200]}")


# ── Helper de normalización de teléfonos MX ──────────────────
def normalize_mx_phone(raw: str) -> str | None:
    """
    Normaliza un teléfono mexicano a E.164 (+52...).

    Acepta:
      "55 1234 5678"       → "+525512345678"
      "+52 55 1234 5678"   → "+525512345678"
      "52 1 55 12345678"   → "+525512345678"   (elimina el '1' histórico de móvil MX)
      "(55) 1234-5678"     → "+525512345678"

    Devuelve None si no logra normalizar.
    """
    if not raw:
        return None
    # Dejar solo + y dígitos
    digits = "".join(c for c in raw if c.isdigit() or c == "+")
    digits = digits.replace("+", "", digits.count("+") if not digits.startswith("+") else digits.count("+") - 1)

    # Si ya empieza con +52 y tiene 13 chars (+52 + 10 dígitos)
    if digits.startswith("+52") and len(digits) == 13:
        return digits
    # +52 1 XXXXXXXXXX (formato antiguo móvil, 14 chars)
    if digits.startswith("+521") and len(digits) == 14:
        return "+52" + digits[4:]
    # Sin + pero empieza con 52 y tiene 12 dígitos → añadir +
    if digits.startswith("52") and len(digits) == 12 and "+" not in digits:
        return "+" + digits
    # 52 1 XXXXXXXXXX sin + (13 dígitos)
    if digits.startswith("521") and len(digits) == 13:
        return "+52" + digits[3:]
    # 10 dígitos planos → asumir MX nacional
    only_digits = digits.replace("+", "")
    if len(only_digits) == 10:
        return "+52" + only_digits
    # Ya E.164 de otro país (>10 dígitos, empieza con +)
    if digits.startswith("+") and 11 <= len(digits) <= 16:
        return digits
    return None
