"""
INDEXA — Google Maps Scraper (Modo Prospección)
================================================
Busca negocios en Google Maps por categoría + ubicación,
extrae nombre/teléfono/dirección, filtra los que NO tienen
sitio web, y sube los resultados a Firestore (prospectos_frios).

Requisitos:
  pip install -r requirements.txt
  playwright install chromium

Uso:
  python scraper_maps.py "Dentistas en CDMX"
  python scraper_maps.py "Plomeros en Monterrey" --max 50
  python scraper_maps.py "Restaurantes en Guadalajara" --headless false
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path

from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, Page, TimeoutError as PwTimeout

# ── Firebase Admin ──────────────────────────────────────────────────
import firebase_admin
from firebase_admin import credentials, firestore

# ── Cargar .env desde la raíz del proyecto ──────────────────────────
ENV_PATH = Path(__file__).resolve().parent.parent / ".env.local"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    # Fallback: buscar .env en la raíz
    alt = Path(__file__).resolve().parent.parent / ".env"
    if alt.exists():
        load_dotenv(alt)


# ── Tipos ───────────────────────────────────────────────────────────
@dataclass
class Prospecto:
    nombre: str
    direccion: str
    telefono: str
    tiene_web: bool = False


# ── Configuración ───────────────────────────────────────────────────
GOOGLE_MAPS_URL = "https://www.google.com/maps"
SCROLL_PAUSE = 1.5  # segundos entre scrolls del panel lateral
DETAIL_WAIT = 1.0   # segundos para cargar el detalle de cada negocio


# ── Helpers ─────────────────────────────────────────────────────────
def limpiar_telefono(raw: str) -> str:
    """Normaliza un teléfono a solo dígitos (conserva +)."""
    cleaned = re.sub(r"[^\d+]", "", raw.strip())
    return cleaned


def init_firestore() -> firestore.Client | None:
    """Inicializa Firebase Admin SDK y retorna el cliente Firestore."""
    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
    project_id = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "")

    if sa_path and Path(sa_path).exists():
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred)
        print(f"  ✓ Firebase inicializado con service account: {sa_path}")
    elif project_id:
        # Usar Application Default Credentials (ADC)
        firebase_admin.initialize_app(options={"projectId": project_id})
        print(f"  ✓ Firebase inicializado con projectId: {project_id}")
    else:
        print("  ✗ No se encontró FIREBASE_SERVICE_ACCOUNT_PATH ni NEXT_PUBLIC_FIREBASE_PROJECT_ID.")
        print("    Los resultados se guardarán solo en JSON local.")
        return None

    return firestore.client()


def obtener_telefonos_existentes(db: firestore.Client) -> set[str]:
    """Obtiene todos los teléfonos ya registrados en prospectos_frios."""
    existentes: set[str] = set()
    docs = db.collection("prospectos_frios").stream()
    for doc in docs:
        data = doc.to_dict()
        tel = data.get("telefono", "")
        if tel:
            existentes.add(limpiar_telefono(tel))
    print(f"  ✓ {len(existentes)} teléfonos ya existentes en Firestore.")
    return existentes


def subir_a_firestore(
    db: firestore.Client,
    prospectos: list[Prospecto],
    existentes: set[str],
) -> int:
    """Sube prospectos a Firestore evitando duplicados por teléfono."""
    subidos = 0
    coleccion = db.collection("prospectos_frios")

    for p in prospectos:
        tel_limpio = limpiar_telefono(p.telefono)

        if not tel_limpio:
            print(f"    ⚠ Sin teléfono, omitido: {p.nombre}")
            continue

        if tel_limpio in existentes:
            print(f"    ⊘ Duplicado, omitido: {p.nombre} ({p.telefono})")
            continue

        coleccion.add({
            "nombre": p.nombre,
            "direccion": p.direccion,
            "telefono": p.telefono,
            "importedAt": firestore.SERVER_TIMESTAMP,
        })
        existentes.add(tel_limpio)
        subidos += 1

    return subidos


# ── Scraper ─────────────────────────────────────────────────────────
def buscar_en_maps(page: Page, query: str) -> None:
    """Navega a Google Maps y ejecuta la búsqueda."""
    page.goto(GOOGLE_MAPS_URL, wait_until="domcontentloaded")
    page.wait_for_timeout(2000)

    # Aceptar cookies si aparece el diálogo (común en EU/MX)
    try:
        accept_btn = page.locator("button:has-text('Aceptar todo')").first
        if accept_btn.is_visible(timeout=3000):
            accept_btn.click()
            page.wait_for_timeout(1000)
    except (PwTimeout, Exception):
        pass

    # Buscar
    search_box = page.locator("#searchboxinput")
    search_box.fill(query)
    search_box.press("Enter")
    page.wait_for_timeout(3000)


def scroll_resultados(page: Page, max_results: int) -> int:
    """Hace scroll en el panel de resultados hasta alcanzar max_results o el final."""
    feed_selector = 'div[role="feed"]'

    try:
        page.wait_for_selector(feed_selector, timeout=10000)
    except PwTimeout:
        print("  ✗ No se encontró el panel de resultados.")
        return 0

    prev_count = 0
    stale_rounds = 0

    while True:
        items = page.locator(f'{feed_selector} > div > div > a').all()
        count = len(items)

        if count >= max_results:
            print(f"  ✓ Alcanzado límite: {count} resultados.")
            break

        if count == prev_count:
            stale_rounds += 1
            if stale_rounds >= 5:
                # Verificar si aparece "Has llegado al final"
                end_text = page.locator("text=/No hay más resultados|Has llegado al final|You've reached the end/i")
                if end_text.count() > 0:
                    print(f"  ✓ Fin de resultados: {count} encontrados.")
                    break
                if stale_rounds >= 8:
                    print(f"  ✓ Sin más resultados después de {stale_rounds} intentos: {count} encontrados.")
                    break
        else:
            stale_rounds = 0

        prev_count = count

        # Scroll dentro del feed
        page.evaluate(
            """(selector) => {
                const el = document.querySelector(selector);
                if (el) el.scrollTop = el.scrollHeight;
            }""",
            feed_selector,
        )
        page.wait_for_timeout(int(SCROLL_PAUSE * 1000))

    return len(page.locator(f'{feed_selector} > div > div > a').all())


def extraer_prospectos(page: Page, max_results: int) -> list[Prospecto]:
    """Itera sobre cada resultado, abre el detalle y extrae datos."""
    feed_selector = 'div[role="feed"]'
    prospectos: list[Prospecto] = []

    links = page.locator(f'{feed_selector} > div > div > a').all()
    total = min(len(links), max_results)
    print(f"\n── Extrayendo datos de {total} negocios ──\n")

    for i in range(total):
        # Re-obtener links porque el DOM cambia al navegar
        try:
            current_links = page.locator(f'{feed_selector} > div > div > a').all()
            if i >= len(current_links):
                break
            current_links[i].click()
            page.wait_for_timeout(int(DETAIL_WAIT * 1000))
        except Exception:
            continue

        nombre = ""
        telefono = ""
        direccion = ""
        tiene_web = False

        # Nombre
        try:
            name_el = page.locator("h1").first
            if name_el.is_visible(timeout=2000):
                nombre = name_el.inner_text().strip()
        except (PwTimeout, Exception):
            pass

        # Buscar en los botones/items de info del panel de detalle
        try:
            info_buttons = page.locator('button[data-tooltip]').all()
            for btn in info_buttons:
                try:
                    tooltip = btn.get_attribute("data-tooltip") or ""
                    aria = btn.get_attribute("aria-label") or ""
                    text = tooltip or aria

                    if not text:
                        continue

                    # Teléfono
                    if re.search(r"[\d\s\-+()]{10,}", text) and not telefono:
                        telefono = text.strip()

                    # Dirección (suele ser más larga y sin muchos dígitos seguidos)
                    if any(kw in text.lower() for kw in ["calle", "av.", "avenida", "col.", "colonia", "blvd", "no.", "núm", "c.p.", "mz"]):
                        if not direccion:
                            direccion = text.strip()
                except Exception:
                    continue
        except Exception:
            pass

        # Fallback: buscar teléfono y dirección en aria-labels de los links del panel
        try:
            info_items = page.locator('a[data-tooltip], button[aria-label]').all()
            for item in info_items:
                try:
                    aria = item.get_attribute("aria-label") or ""
                    href = item.get_attribute("href") or ""

                    # Teléfono por href tel:
                    if href.startswith("tel:") and not telefono:
                        telefono = href.replace("tel:", "").strip()

                    # Teléfono por aria-label con patrón numérico
                    if not telefono and re.search(r"[\d]{7,}", aria.replace(" ", "")):
                        telefono = aria.strip()

                    # Dirección
                    if not direccion and len(aria) > 20 and not re.match(r"^[\d\s\-+()]+$", aria):
                        if any(c.isdigit() for c in aria):
                            direccion = aria.strip()

                    # Sitio web
                    if href and not href.startswith("tel:") and not href.startswith("mailto:"):
                        if "google.com" not in href and "maps" not in href:
                            tiene_web = True
                except Exception:
                    continue
        except Exception:
            pass

        # Detección adicional de sitio web: buscar el botón/link "Sitio web"
        try:
            web_link = page.locator('a[data-tooltip="Abrir el sitio web"], a[aria-label*="sitio web"], a[aria-label*="Sitio web"], a[data-tooltip*="sitio web"]').first
            if web_link.is_visible(timeout=500):
                tiene_web = True
        except (PwTimeout, Exception):
            pass

        # Limpiar teléfono
        if telefono:
            telefono = re.sub(r"^.*?(\+?[\d])", r"\1", telefono)
            telefono = re.sub(r"[^\d+\s\-()]", "", telefono).strip()

        progress = f"[{i+1}/{total}]"
        web_tag = "🌐 CON web" if tiene_web else "✗ SIN web"

        if nombre:
            print(f"  {progress} {nombre}")
            print(f"         Tel: {telefono or '—'}  |  Dir: {(direccion[:50] + '...') if len(direccion) > 50 else (direccion or '—')}  |  {web_tag}")

            prospectos.append(Prospecto(
                nombre=nombre,
                direccion=direccion,
                telefono=telefono,
                tiene_web=tiene_web,
            ))

        # Volver a la lista
        try:
            back_btn = page.locator('button[aria-label="Atrás"], button[jsaction*="back"]').first
            if back_btn.is_visible(timeout=1000):
                back_btn.click()
                page.wait_for_timeout(800)
            else:
                page.go_back()
                page.wait_for_timeout(1000)
        except Exception:
            page.go_back()
            page.wait_for_timeout(1000)

    return prospectos


# ── Main ────────────────────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(
        description="INDEXA — Scraper de Google Maps para prospección fría"
    )
    parser.add_argument(
        "query",
        help="Búsqueda (ej: 'Dentistas en CDMX', 'Plomeros en Monterrey')",
    )
    parser.add_argument(
        "--max",
        type=int,
        default=30,
        help="Máximo de resultados a extraer (default: 30)",
    )
    parser.add_argument(
        "--headless",
        default="true",
        choices=["true", "false"],
        help="Ejecutar sin ventana visible (default: true)",
    )
    parser.add_argument(
        "--output",
        default="prospectos_output.json",
        help="Archivo JSON de salida local (default: prospectos_output.json)",
    )

    args = parser.parse_args()
    headless = args.headless == "true"

    print("=" * 60)
    print("  INDEXA — Google Maps Scraper")
    print("=" * 60)
    print(f"  Búsqueda:  {args.query}")
    print(f"  Máximo:    {args.max} resultados")
    print(f"  Headless:  {headless}")
    print(f"  Output:    {args.output}")
    print("=" * 60)

    # ── 1. Iniciar Firestore ────────────────────────────────────────
    print("\n── Conectando a Firebase ──\n")
    db = init_firestore()
    existentes: set[str] = set()
    if db:
        existentes = obtener_telefonos_existentes(db)

    # ── 2. Scraping ─────────────────────────────────────────────────
    print("\n── Iniciando navegador ──\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=headless,
            args=["--lang=es-MX", "--no-sandbox"],
        )
        context = browser.new_context(
            locale="es-MX",
            geolocation={"latitude": 19.4326, "longitude": -99.1332},
            permissions=["geolocation"],
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()

        print("  Buscando en Google Maps...")
        buscar_en_maps(page, args.query)

        print("  Haciendo scroll para cargar resultados...")
        total_visible = scroll_resultados(page, args.max)
        print(f"  → {total_visible} resultados visibles en el panel.\n")

        todos_prospectos = extraer_prospectos(page, args.max)

        browser.close()

    # ── 3. Filtrar: solo SIN sitio web ──────────────────────────────
    sin_web = [p for p in todos_prospectos if not p.tiene_web]
    con_web = len(todos_prospectos) - len(sin_web)

    print(f"\n── Resumen de extracción ──\n")
    print(f"  Total extraídos:    {len(todos_prospectos)}")
    print(f"  Con sitio web:      {con_web} (descartados)")
    print(f"  Sin sitio web:      {len(sin_web)} (prospectos válidos)")

    # ── 4. Guardar JSON local ───────────────────────────────────────
    output_path = Path(__file__).parent / args.output
    json_data = [asdict(p) for p in sin_web]
    # Quitar el campo tiene_web del output
    for item in json_data:
        item.pop("tiene_web", None)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    print(f"\n  ✓ JSON guardado en: {output_path}")

    # ── 5. Subir a Firestore ────────────────────────────────────────
    if db and sin_web:
        print(f"\n── Subiendo a Firestore ──\n")
        subidos = subir_a_firestore(db, sin_web, existentes)
        print(f"\n  ✓ {subidos} prospectos nuevos subidos a prospectos_frios.")
        print(f"  ⊘ {len(sin_web) - subidos} omitidos (duplicados o sin teléfono).")
    elif not db:
        print("\n  ⚠ Firestore no disponible. Solo se guardó el JSON local.")
    else:
        print("\n  ℹ No hay prospectos sin web para subir.")

    print(f"\n{'=' * 60}")
    print("  ✓ Scraping completado.")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
