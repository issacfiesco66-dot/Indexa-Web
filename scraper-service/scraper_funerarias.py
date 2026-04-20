"""
INDEXA — Scraper de Funerarias → Historias Infinitas
=====================================================
Busca funerarias en Google Maps ciudad por ciudad, registra cada una en la
API de Historias Infinitas (obtiene link personalizado `/partners?lead=<token>`)
y las guarda en Firestore (`funeraria_leads`) para que el admin las
contacte manualmente vía WhatsApp desde /admin/prospectos (pestaña Funerarias).

Modos:
  python scraper_funerarias.py --dry-run       # scrapea y muestra, NO guarda ni llama a HI
  python scraper_funerarias.py                 # ejecución real (scrape + HI + Firestore)
  python scraper_funerarias.py --max 10        # sobreescribe max_por_busqueda
  python scraper_funerarias.py --ciudad Toluca # solo una ciudad (debug)

Requisitos:
  pip install -r requirements.txt   (playwright, requests, python-dotenv)
  playwright install chromium

Config:
  config_funerarias.json — ciudades + max_por_busqueda
  .env.local — HI_API_BASE_URL, HI_INDEXA_API_KEY, SCRAPER_EMAIL, SCRAPER_PASSWORD, Firebase vars

A diferencia de scraper_indexa.py, este script NO filtra por "tiene_web":
las funerarias con sitio web también son targets válidos para el pitch de HI.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

# UTF-8 stdout en Windows (emojis, etc.)
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import requests
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright

# Reutilizamos Playwright/Maps helpers del scraper principal
from scraper_indexa import (
    buscar_en_maps,
    scroll_resultados,
    extraer_prospectos,
    authenticate,
    generate_slug,
    load_env_bom_safe,
)
from hi_client import HIClient, HIClientError, normalize_mx_phone


ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config_funerarias.json"
LOG_PATH = ROOT / "logs_funerarias.txt"

# ── Env ──────────────────────────────────────────────────────
for env_file in [".env.local", ".env"]:
    p = ROOT / env_file
    if p.exists():
        load_env_bom_safe(p)
        break

API_KEY = os.getenv("NEXT_PUBLIC_FIREBASE_API_KEY", "")
PROJECT_ID = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "")
FIRESTORE_BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"


# ── JSON progress mode (para el wrapper FastAPI de Railway) ─────────
# Cuando se ejecuta con --json-progress, cada evento importante se emite
# como una línea JSON a stdout para que main.py del scraper-service lo lea.
_JSON_MODE = False


def emit_progress(progress: int, message: str, **extra):
    """Emite evento de progreso. JSON en modo Railway, log normal en terminal."""
    if _JSON_MODE:
        payload = {"progress": int(progress), "message": message, **extra}
        sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
        sys.stdout.flush()
    else:
        # En modo terminal, lo maneja el logger normal
        pass


def emit_done(stats: dict):
    """Emite el evento final con stats agregadas."""
    if _JSON_MODE:
        payload = {"event": "done", "progress": 100, "message": "Scraper terminado", **stats}
        sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
        sys.stdout.flush()


# ── Logger ───────────────────────────────────────────────────
def setup_logger(json_mode: bool = False) -> logging.Logger:
    """
    En modo normal: loguea a archivo + stdout.
    En modo JSON (Railway): solo loguea a archivo (stdout reservado para eventos JSON).
    """
    logger = logging.getLogger("funerarias_scraper")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()
    fmt = logging.Formatter("[%(asctime)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    fh = logging.FileHandler(LOG_PATH, mode="a", encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)
    if not json_mode:
        ch = logging.StreamHandler(sys.stdout)
        ch.setFormatter(fmt)
        logger.addHandler(ch)
    return logger


# Logger se inicializa lazy en main() según json_mode. Placeholder para mypy:
log: logging.Logger = logging.getLogger("funerarias_scraper")


# ── Firestore helpers ────────────────────────────────────────
def fetch_existing_phones(token: str) -> set[str]:
    """Teléfonos ya presentes en funeraria_leads (para dedup local)."""
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents:runQuery"
    query = {
        "structuredQuery": {
            "from": [{"collectionId": "funeraria_leads"}],
            "select": {"fields": [{"fieldPath": "phone"}]},
        }
    }
    out: set[str] = set()
    try:
        res = requests.post(
            url, json=query,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            timeout=30,
        )
        if res.status_code == 200:
            for item in res.json():
                doc = item.get("document", {})
                phone = doc.get("fields", {}).get("phone", {}).get("stringValue", "")
                if phone:
                    out.add(phone)
        else:
            log.warning(f"Firestore runQuery devolvió {res.status_code}: {res.text[:200]}")
    except Exception as e:
        log.warning(f"Error consultando funeraria_leads existentes: {e}")
    return out


def save_funeraria_lead(
    token: str,
    nombre: str,
    phone: str,
    ciudad: str,
    direccion: str,
    hi_lead_id: str,
    hi_token: str,
    hi_link: str,
    vertical: str = "funeraria",
) -> bool:
    """Guarda un lead en Firestore con status='pendiente_envio'."""
    now = datetime.now(timezone.utc).isoformat()
    fields = {
        "nombre":       {"stringValue": nombre},
        "slug":         {"stringValue": generate_slug(nombre)},
        "phone":        {"stringValue": phone},
        "ciudad":       {"stringValue": ciudad},
        "direccion":    {"stringValue": direccion or ""},
        "status":       {"stringValue": "pendiente_envio"},
        "vertical":     {"stringValue": vertical},
        "hi_lead_id":   {"stringValue": hi_lead_id},
        "hi_token":     {"stringValue": hi_token},
        "hi_link":      {"stringValue": hi_link},
        "createdAt":    {"timestampValue": now},
        "sentAt":       {"nullValue": None},
        "engagedAt":    {"nullValue": None},
        "optedOutAt":   {"nullValue": None},
        "source":       {"stringValue": f"scraper_{vertical}"},
    }
    try:
        res = requests.post(
            f"{FIRESTORE_BASE}/funeraria_leads?key={API_KEY}",
            json={"fields": fields},
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            timeout=20,
        )
        if res.status_code == 200:
            return True
        log.warning(f"    ✗ Firestore insert falló {res.status_code}: {res.text[:200]}")
        return False
    except Exception as e:
        log.warning(f"    ✗ Firestore insert error: {e}")
        return False


# ── Config loader ────────────────────────────────────────────
def load_config() -> dict:
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Falta {CONFIG_PATH}")
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Core ─────────────────────────────────────────────────────
@dataclass
class Stats:
    ciudades: int = 0
    extraidos: int = 0
    sin_telefono: int = 0
    opt_out: int = 0
    already: int = 0
    duplicados: int = 0
    subidos: int = 0
    errores: int = 0


VALID_VERTICALS = ("funeraria", "veterinaria", "hospicio", "geriatrico")


def run(
    dry_run: bool,
    max_override: int | None,
    ciudad_filter: str | None,
    vertical: str = "funeraria",
) -> Stats:
    stats = Stats()
    cfg = load_config()
    ciudades = cfg["ciudades"]
    max_por_busqueda = max_override or cfg.get("max_por_busqueda", 15)
    delay_ciudades = cfg.get("delay_entre_ciudades_sec", 20)

    if ciudad_filter:
        ciudades = [c for c in ciudades if c.lower() == ciudad_filter.lower()]
        if not ciudades:
            log.error(f"Ciudad '{ciudad_filter}' no está en config_funerarias.json")
            return stats

    # HI client
    if dry_run:
        log.info("MODO DRY-RUN — no se llamará a HI ni se escribirá Firestore")
        emit_progress(2, "Modo DRY-RUN")
        hi = None
        optouts: set[str] = set()
    else:
        emit_progress(2, "Inicializando cliente HI…")
        try:
            hi = HIClient()
        except HIClientError as e:
            log.error(f"HI Client no inicializado: {e}")
            return stats
        try:
            optouts = hi.fetch_optouts()
            log.info(f"HI blocklist: {len(optouts)} teléfonos opt-out descargados")
            emit_progress(5, f"Blocklist HI: {len(optouts)} opt-outs")
        except HIClientError as e:
            log.error(f"No se pudo descargar blocklist de HI: {e}")
            return stats

    # Firebase auth
    if dry_run:
        fb_token = None
        existing_phones: set[str] = set()
    else:
        emit_progress(7, "Autenticando Firebase…")
        fb_token = authenticate()
        if not fb_token:
            log.error("No se pudo autenticar con Firebase (revisa SCRAPER_EMAIL/PASSWORD)")
            return stats
        existing_phones = fetch_existing_phones(fb_token)
        log.info(f"Firestore: {len(existing_phones)} funeraria_leads existentes")
        emit_progress(10, f"Firestore: {len(existing_phones)} leads existentes")

    total_ciudades = len(ciudades) or 1

    # Scrape city by city
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1400, "height": 900},
            locale="es-MX",
        )
        page = ctx.new_page()

        for idx, ciudad in enumerate(ciudades):
            stats.ciudades += 1
            query = f"{vertical} en {ciudad}"
            city_progress = 10 + int((idx / total_ciudades) * 80)
            emit_progress(city_progress, f"Scrapeando {query}", ciudad=ciudad, vertical=vertical)
            log.info("")
            log.info("=" * 60)
            log.info(f"🔎 {query}  (max {max_por_busqueda})")
            log.info("=" * 60)

            try:
                buscar_en_maps(page, query)
                scroll_resultados(page, max_por_busqueda)
                resultados = extraer_prospectos(page, max_por_busqueda)
            except Exception as e:
                log.error(f"Error scrapeando {ciudad}: {type(e).__name__}: {e}")
                stats.errores += 1
                continue

            stats.extraidos += len(resultados)

            for p in resultados:
                nombre = p.nombre.strip()
                phone_raw = p.telefono.strip()
                phone = normalize_mx_phone(phone_raw) if phone_raw else None

                if not phone:
                    log.info(f"    ⚠ Sin teléfono válido: {nombre}")
                    stats.sin_telefono += 1
                    continue

                if phone in optouts:
                    log.info(f"    ⛔ Opt-out en HI: {nombre} ({phone})")
                    stats.opt_out += 1
                    continue

                if phone in existing_phones:
                    log.info(f"    ↺ Ya en Firestore: {nombre} ({phone})")
                    stats.duplicados += 1
                    continue

                if dry_run:
                    log.info(f"    [DRY] {nombre} | {phone} | {p.direccion[:40]}")
                    continue

                # Real: call HI ingest
                try:
                    res = hi.ingest_lead(
                        business_name=nombre,
                        phone=phone,
                        vertical=vertical,
                        city=ciudad,
                        notes=p.direccion or None,
                    )
                except HIClientError as e:
                    log.error(f"    ✗ HI ingest error para {nombre}: {e}")
                    stats.errores += 1
                    continue

                if res.get("opted_out"):
                    log.info(f"    ⛔ HI indica opt-out: {nombre}")
                    stats.opt_out += 1
                    optouts.add(phone)
                    continue
                if res.get("already"):
                    log.info(f"    ↺ Ya en funnel HI: {nombre} ({res.get('status')})")
                    stats.already += 1
                    continue

                hi_lead_id = res.get("lead_id", "")
                hi_token_v = res.get("token", "")
                hi_link = res.get("link", "")

                ok = save_funeraria_lead(
                    token=fb_token,
                    nombre=nombre,
                    phone=phone,
                    ciudad=ciudad,
                    direccion=p.direccion or "",
                    hi_lead_id=hi_lead_id,
                    hi_token=hi_token_v,
                    hi_link=hi_link,
                    vertical=vertical,
                )
                if ok:
                    existing_phones.add(phone)
                    stats.subidos += 1
                    log.info(f"    ✓ {nombre} | {phone} → {hi_link}")
                else:
                    stats.errores += 1

            if delay_ciudades and ciudad != ciudades[-1]:
                log.info(f"⏳ Esperando {delay_ciudades}s antes de la siguiente ciudad…")
                time.sleep(delay_ciudades)

        browser.close()

    return stats


# ── Main ─────────────────────────────────────────────────────
def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="No llama a HI, no escribe Firestore")
    parser.add_argument("--max", type=int, help="Sobreescribe max_por_busqueda")
    parser.add_argument("--ciudad", type=str, help="Solo una ciudad (debug)")
    parser.add_argument("--vertical", type=str, default="funeraria",
                        choices=list(VALID_VERTICALS),
                        help="Tipo de negocio a scrapear (default: funeraria)")
    parser.add_argument("--json-progress", action="store_true", help="Emite progreso como JSON (Railway)")
    args = parser.parse_args()

    global _JSON_MODE, log
    _JSON_MODE = bool(args.json_progress)
    log = setup_logger(json_mode=_JSON_MODE)

    emit_progress(0, f"Iniciando scraper de {args.vertical}s")
    log.info("=" * 60)
    log.info(f"INDEXA Scraper B2B — Inicio (vertical={args.vertical})")
    log.info(f"Modo: {'DRY-RUN' if args.dry_run else 'REAL'} · JSON: {_JSON_MODE}")
    log.info("=" * 60)

    t0 = time.time()
    stats = run(
        dry_run=args.dry_run,
        max_override=args.max,
        ciudad_filter=args.ciudad,
        vertical=args.vertical,
    )
    elapsed = time.time() - t0

    log.info("")
    log.info("=" * 60)
    log.info("RESUMEN FINAL")
    log.info("=" * 60)
    log.info(f"  Ciudades procesadas:  {stats.ciudades}")
    log.info(f"  Funerarias extraídas: {stats.extraidos}")
    log.info(f"  Sin teléfono válido:  {stats.sin_telefono}")
    log.info(f"  Opt-out (HI):         {stats.opt_out}")
    log.info(f"  Ya en funnel HI:      {stats.already}")
    log.info(f"  Duplicados Firestore: {stats.duplicados}")
    log.info(f"  Nuevos guardados:     {stats.subidos}")
    log.info(f"  Errores:              {stats.errores}")
    log.info(f"  Tiempo total:         {int(elapsed)}s")
    log.info("=" * 60)

    emit_done({
        "ciudades": stats.ciudades,
        "extraidos": stats.extraidos,
        "sin_telefono": stats.sin_telefono,
        "opt_out": stats.opt_out,
        "already": stats.already,
        "duplicados": stats.duplicados,
        "subidos": stats.subidos,
        "errores": stats.errores,
        "elapsed_s": int(elapsed),
    })

    return 0 if stats.errores == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
