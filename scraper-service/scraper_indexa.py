"""
INDEXA — Google Maps Scraper v3 (REST API + Batch Mode)
========================================================
Busca negocios en Google Maps, filtra los que NO tienen sitio web,
genera slugs automáticos, y sube los resultados a Firestore via REST API.

Modos de uso:
  1) Query único:
     python scraper_indexa.py "Dentistas en CDMX"
     python scraper_indexa.py "Plomeros en Monterrey" --max 50

  2) Batch autónomo (lee config_busqueda.json):
     python scraper_indexa.py --batch
     python scraper_indexa.py --batch --max 20

  3) Desde el dashboard (API SSE):
     python scraper_indexa.py "Tacos en CDMX" --json-progress

Requisitos:
  pip install playwright python-dotenv requests
  playwright install chromium
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import unicodedata

# Force UTF-8 stdout on Windows to avoid cp1252 encoding errors with Unicode symbols
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
import logging
from dataclasses import dataclass, asdict, field
from pathlib import Path
from datetime import datetime, timezone

# ── JSON progress mode (set by --json-progress flag) ─────────────────
_JSON_MODE = False

def emit(event: str, **kwargs):
    """Emit a progress event. In JSON mode, outputs a JSON line. Otherwise prints."""
    if _JSON_MODE:
        payload = {"event": event, **kwargs}
        sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
        sys.stdout.flush()
    else:
        msg = kwargs.get("message", "")
        if msg:
            print(msg)

import requests
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, Page, TimeoutError as PwTimeout

# ── Cargar .env.local desde la raíz del proyecto ─────────────────────
ROOT = Path(__file__).resolve().parent

def load_env_bom_safe(filepath: Path) -> None:
    """Load .env file handling potential BOM (byte order mark) on first line."""
    if not filepath.exists():
        return
    text = filepath.read_text(encoding="utf-8-sig")
    # Write a temp clean version without BOM for dotenv
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".env", delete=False, encoding="utf-8") as tmp:
        tmp.write(text)
        tmp_path = tmp.name
    load_dotenv(tmp_path, override=True)
    os.unlink(tmp_path)

for env_file in [".env.local", ".env"]:
    p = ROOT / env_file
    if p.exists():
        load_env_bom_safe(p)
        break

# ── Config ────────────────────────────────────────────────────────────
API_KEY = os.getenv("NEXT_PUBLIC_FIREBASE_API_KEY", "")
PROJECT_ID = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "")
AUTH_EMAIL = os.getenv("SCRAPER_EMAIL", "")
AUTH_PASSWORD = os.getenv("SCRAPER_PASSWORD", "")

FIRESTORE_BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"
AUTH_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"

GOOGLE_MAPS_URL = "https://www.google.com/maps"
SCROLL_PAUSE = 1.5
DETAIL_WAIT = 1.0


# ── Tipos ─────────────────────────────────────────────────────────────
@dataclass
class Prospecto:
    nombre: str
    slug: str = ""
    email: str = ""
    direccion: str = ""
    telefono: str = ""
    categoria: str = ""
    ciudad: str = ""
    tiene_web: bool = False


# ── Helpers ───────────────────────────────────────────────────────────
def generate_slug(name: str) -> str:
    """Genera un slug URL-safe a partir del nombre del negocio."""
    normalized = unicodedata.normalize("NFD", name.lower())
    without_accents = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    slug = re.sub(r"[^a-z0-9]+", "-", without_accents).strip("-")
    return slug


def limpiar_telefono(raw: str) -> str:
    return re.sub(r"[^\d+]", "", raw.strip())


# ── Firebase Auth (REST) ──────────────────────────────────────────────
def authenticate() -> str | None:
    """Inicia sesión con email/password y retorna el ID token."""
    if not AUTH_EMAIL or not AUTH_PASSWORD or not API_KEY:
        print("  ⚠ Variables SCRAPER_EMAIL / SCRAPER_PASSWORD / API_KEY no configuradas.")
        print("    Los resultados se guardarán solo en JSON local.")
        return None

    try:
        res = requests.post(AUTH_URL, json={
            "email": AUTH_EMAIL,
            "password": AUTH_PASSWORD,
            "returnSecureToken": True,
        })
        if res.status_code == 200:
            token = res.json().get("idToken")
            print(f"  ✓ Autenticado como: {AUTH_EMAIL}")
            return token
        else:
            error = res.json().get("error", {}).get("message", res.text)
            print(f"  ✗ Error de autenticación: {error}")
            return None
    except Exception as e:
        print(f"  ✗ Error de conexión: {e}")
        return None


# ── Firestore REST helpers ────────────────────────────────────────────
def obtener_telefonos_existentes(token: str) -> set[str]:
    """Obtiene todos los teléfonos ya registrados en prospectos_frios."""
    existentes: set[str] = set()

    # Usar structuredQuery para obtener solo el campo telefono
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents:runQuery"
    query = {
        "structuredQuery": {
            "from": [{"collectionId": "prospectos_frios"}],
            "select": {"fields": [{"fieldPath": "telefono"}]},
        }
    }

    try:
        res = requests.post(url, json=query, headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        })

        if res.status_code == 200:
            docs = res.json()
            for item in docs:
                doc = item.get("document", {})
                fields = doc.get("fields", {})
                tel = fields.get("telefono", {}).get("stringValue", "")
                if tel:
                    existentes.add(limpiar_telefono(tel))

        print(f"  ✓ {len(existentes)} teléfonos ya existentes en Firestore.")
    except Exception as e:
        print(f"  ⚠ Error al consultar existentes: {e}")

    return existentes


def subir_prospecto(token: str, prospecto: Prospecto, categoria: str, ciudad: str) -> bool:
    """Sube un prospecto a Firestore via REST API."""
    now = datetime.now(timezone.utc).isoformat()

    fields = {
        "nombre": {"stringValue": prospecto.nombre},
        "slug": {"stringValue": prospecto.slug},
        "email": {"stringValue": prospecto.email},
        "direccion": {"stringValue": prospecto.direccion},
        "telefono": {"stringValue": prospecto.telefono},
        "categoria": {"stringValue": categoria or prospecto.categoria},
        "ciudad": {"stringValue": ciudad or prospecto.ciudad},
        "status": {"stringValue": "nuevo"},
        "tieneWeb": {"booleanValue": prospecto.tiene_web},
        "importedAt": {"timestampValue": now},
        "fechaUltimoContacto": {"nullValue": None},
        "vistasDemo": {"integerValue": "0"},
        "nivelSeguimiento": {"integerValue": "0"},
    }

    try:
        res = requests.post(
            f"{FIRESTORE_BASE}/prospectos_frios?key={API_KEY}",
            json={"fields": fields},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
        )
        return res.status_code == 200
    except Exception as e:
        print(f"    ✗ Error subiendo {prospecto.nombre}: {e}")
        return False


# ── Scraper ───────────────────────────────────────────────────────────
def buscar_en_maps(page: Page, query: str) -> None:
    """Navega a Google Maps y ejecuta la búsqueda."""
    page.goto(GOOGLE_MAPS_URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(5000)

    # Aceptar cookies si aparece
    for btn_text in ["Aceptar todo", "Accept all", "Acepto", "I agree"]:
        try:
            accept_btn = page.locator(f"button:has-text('{btn_text}')").first
            if accept_btn.is_visible(timeout=2000):
                accept_btn.click()
                page.wait_for_timeout(1500)
                break
        except (PwTimeout, Exception):
            continue

    # Try multiple selectors for the search box
    search_selectors = [
        "#searchboxinput",
        "input[name='q']",
        "input[aria-label*='Buscar']",
        "input[aria-label*='Search']",
    ]

    search_box = None
    for selector in search_selectors:
        try:
            el = page.locator(selector).first
            if el.is_visible(timeout=5000):
                search_box = el
                print(f"  ✓ Search box encontrado: {selector}")
                break
        except (PwTimeout, Exception):
            continue

    if not search_box:
        raise RuntimeError("No se encontró el campo de búsqueda en Google Maps.")

    search_box.click()
    page.wait_for_timeout(500)
    search_box.fill(query)
    page.wait_for_timeout(500)
    search_box.press("Enter")
    page.wait_for_timeout(6000)

    # Wait for results to actually appear (feed or place links)
    try:
        page.wait_for_selector('div[role="feed"], a[href*="/maps/place/"]', timeout=10000)
        page.wait_for_timeout(2000)
        print(f"  ✓ Resultados cargados para: {query}")
    except PwTimeout:
        print(f"  ⚠ Timeout esperando resultados para: {query}")
        try:
            page.screenshot(path="debug_after_search.png")
            print("  📸 Screenshot guardado: debug_after_search.png")
        except Exception:
            pass


# Multiple selectors for result items (Google Maps changes DOM frequently)
RESULT_ITEM_SELECTORS = [
    'div[role="feed"] > div > div > a',
    'div[role="feed"] a[href*="/maps/place/"]',
    'div[role="feed"] [jsaction] a[href*="/maps/place/"]',
    'a[href*="/maps/place/"]',
]


def _find_result_items(page: Page) -> list:
    """Try multiple selectors to find result items in the feed."""
    for selector in RESULT_ITEM_SELECTORS:
        items = page.locator(selector).all()
        if items:
            return items
    return []


def _find_feed(page: Page) -> str | None:
    """Try multiple selectors for the results scrollable container."""
    for selector in ['div[role="feed"]', 'div[role="main"] div[tabindex="-1"]', 'div[role="main"]']:
        try:
            if page.locator(selector).first.is_visible(timeout=2000):
                return selector
        except (PwTimeout, Exception):
            continue
    return None


def scroll_resultados(page: Page, max_results: int) -> int:
    """Hace scroll en el panel de resultados."""
    feed_selector = _find_feed(page)

    if not feed_selector:
        # Last resort: wait a bit longer and retry
        page.wait_for_timeout(5000)
        feed_selector = _find_feed(page)

    if not feed_selector:
        print("  ✗ No se encontró el panel de resultados.")
        # Debug: take screenshot
        try:
            page.screenshot(path="debug_no_feed.png")
            print("  📸 Screenshot guardado: debug_no_feed.png")
        except Exception:
            pass
        return 0

    print(f"  ✓ Feed encontrado: {feed_selector}")

    prev_count = 0
    stale_rounds = 0

    while True:
        items = _find_result_items(page)
        count = len(items)

        if count >= max_results:
            print(f"  ✓ Alcanzado límite: {count} resultados.")
            break

        if count == prev_count:
            stale_rounds += 1
            if stale_rounds >= 5:
                end_text = page.locator("text=/No hay más resultados|Has llegado al final|You've reached the end/i")
                if end_text.count() > 0:
                    print(f"  ✓ Fin de resultados: {count} encontrados.")
                    break
                if stale_rounds >= 8:
                    print(f"  ✓ Sin más resultados: {count} encontrados.")
                    break
        else:
            stale_rounds = 0

        prev_count = count

        page.evaluate(
            """(selector) => {
                const el = document.querySelector(selector);
                if (el) el.scrollTop = el.scrollHeight;
            }""",
            feed_selector,
        )
        page.wait_for_timeout(int(SCROLL_PAUSE * 1000))

    return len(_find_result_items(page))


def volver_a_lista(page: Page, expected_min: int = 0) -> None:
    """Navigate back to the results list in Google Maps.
    
    Strategy order:
    1. Press Escape (closes detail overlay, preserves feed DOM)
    2. Click back button  
    3. Browser back as last resort
    """
    # Strategy 1: Escape key — best for closing detail panel overlays
    page.keyboard.press("Escape")
    page.wait_for_timeout(1500)

    # Check if feed items are back
    items = _find_result_items(page)
    if items and len(items) >= max(expected_min, 1):
        return

    # Strategy 2: Click back button
    for selector in [
        'button[aria-label="Atrás"]',
        'button[aria-label="Back"]',
        'button[jsaction*="back"]',
    ]:
        try:
            btn = page.locator(selector).first
            if btn.is_visible(timeout=1500):
                btn.click()
                page.wait_for_timeout(2000)
                break
        except (PwTimeout, Exception):
            continue
    else:
        # Strategy 3: browser back
        page.go_back()
        page.wait_for_timeout(2000)

    # Wait for the feed to reappear
    try:
        page.wait_for_selector('div[role="feed"]', timeout=8000)
        page.wait_for_timeout(1000)
    except (PwTimeout, Exception):
        page.wait_for_timeout(2000)

    # Wait until items are visible again
    if expected_min > 0:
        for _ in range(8):
            items = _find_result_items(page)
            if len(items) >= expected_min:
                return
            page.wait_for_timeout(800)
        # If still not enough, log it
        actual = len(_find_result_items(page))
        print(f"  ⚠ Esperaba {expected_min} items, encontró {actual} tras volver.")


def extraer_prospectos(page: Page, max_results: int) -> list[Prospecto]:
    """Extract prospects by clicking each Maps result and reading the detail panel."""
    prospectos: list[Prospecto] = []

    links = _find_result_items(page)
    total = min(len(links), max_results)
    print(f"\n── Extrayendo datos de {total} negocios ──\n")

    for i in range(total):
        nombre = ""
        telefono = ""
        direccion = ""
        tiene_web = False

        try:
            # Re-query links every iteration (DOM may have changed)
            current_links = _find_result_items(page)
            if i >= len(current_links):
                print(f"  [{i+1}/{total}] ⚠ No más items en el DOM, deteniendo.")
                break

            # Get name hint from aria-label before clicking
            aria_hint = current_links[i].get_attribute("aria-label") or ""

            # Click the result
            current_links[i].click(timeout=5000)
            page.wait_for_timeout(2000)

            # Wait for a detail h1 that is NOT "Resultados" / "Results"
            try:
                page.wait_for_function(
                    """() => {
                        const h1 = document.querySelector('h1');
                        return h1 && h1.innerText && !h1.innerText.includes('Resultado') && !h1.innerText.includes('Result');
                    }""",
                    timeout=5000,
                )
                name_el = page.locator("h1").first
                nombre = name_el.inner_text().strip()
            except (PwTimeout, Exception):
                # Fallback: use aria-label from the list link
                if aria_hint:
                    nombre = aria_hint.split(".")[0].strip()

            if not nombre or "resultado" in nombre.lower():
                print(f"  [{i+1}/{total}] ⚠ No se pudo extraer nombre, saltando.")
                volver_a_lista(page)
                continue

            # ── Scan detail panel for phone, address, website ──
            try:
                all_elements = page.locator('[data-tooltip], [aria-label], a[href^="tel:"]').all()
                for el in all_elements:
                    try:
                        aria = el.get_attribute("aria-label") or ""
                        tooltip = el.get_attribute("data-tooltip") or ""
                        href = el.get_attribute("href") or ""
                        text = tooltip or aria

                        # Phone from tel: href
                        if href.startswith("tel:") and not telefono:
                            telefono = href.replace("tel:", "").strip()
                            continue

                        # Phone from text pattern
                        if not telefono and text and re.search(r"[\d]{7,}", text.replace(" ", "")):
                            if len(text) < 30:
                                telefono = text.strip()
                                continue

                        # Address keywords
                        if not direccion and text:
                            lower = text.lower()
                            # Skip UI tooltips, ratings, reviews, hours
                            if any(skip in lower for skip in [
                                "estrellas", "stars", "opiniones", "reviews",
                                "horario", "hours", "abierto", "cerrado",
                                "open", "closed", "copiar", "copy",
                                "alejar", "acercar", "zoom", "3d",
                                "compartir", "share", "guardar", "save",
                                "enviar", "send", "reclamar", "claim",
                                "sugerir", "suggest", "añadir", "add",
                                "ver más", "see more", "ver todo",
                                "mapa", "teclas", "flecha", "desplazar",
                                "keyboard", "arrow", "navigate",
                            ]):
                                continue
                            if any(kw in lower for kw in [
                                "calle", "av.", "avenida", "col.", "colonia",
                                "blvd", "c.p.", "mz", "dirección", "address",
                                "núm", "no.", "piso", "int.", "local",
                            ]):
                                direccion = text.strip()
                                continue
                            if len(text) > 25 and any(c.isdigit() for c in text) and not re.match(r"^[\d\s\-+()]+$", text):
                                direccion = text.strip()
                                continue

                        # Website detection
                        if href and not href.startswith("tel:") and not href.startswith("mailto:"):
                            if "google.com" not in href and "maps" not in href and "javascript" not in href:
                                tiene_web = True
                    except Exception:
                        continue
            except Exception:
                pass

            # Extra web link check
            try:
                web_link = page.locator(
                    'a[data-tooltip*="sitio web"], a[data-tooltip*="website"], '
                    'a[aria-label*="sitio web"], a[aria-label*="Sitio web"]'
                ).first
                if web_link.is_visible(timeout=300):
                    tiene_web = True
            except (PwTimeout, Exception):
                pass

            # Clean phone
            if telefono:
                telefono = re.sub(r"^.*?(\+?[\d])", r"\1", telefono)
                telefono = re.sub(r"[^\d+\s\-()]", "", telefono).strip()

            web_tag = "🌐 CON web" if tiene_web else "✗ SIN web"
            print(f"  [{i+1}/{total}] {nombre}")
            print(f"         Tel: {telefono or '—'}  |  Dir: {(direccion[:50] + '...') if len(direccion) > 50 else (direccion or '—')}  |  {web_tag}")

            prospectos.append(Prospecto(
                nombre=nombre,
                slug=generate_slug(nombre),
                direccion=direccion,
                telefono=telefono,
                tiene_web=tiene_web,
            ))

        except PwTimeout:
            print(f"  [{i+1}/{total}] ⚠ Timeout, saltando.")
        except Exception as e:
            print(f"  [{i+1}/{total}] ⚠ Error: {type(e).__name__}")

        # Go back to the list using back button (preserves DOM state)
        volver_a_lista(page, expected_min=min(total, i + 1))

    return prospectos


def extraer_prospectos_with_progress(page: Page, max_results: int, total_visible: int) -> list[Prospecto]:
    """Wrapper that emits JSON progress events during extraction."""
    links = _find_result_items(page)
    total = min(len(links), max_results)

    emit("phase", message=f"Extrayendo datos de {total} negocios...", phase="extracting", progress=42, total_items=total)

    prospectos = extraer_prospectos(page, max_results)

    # Emit per-item results for JSON mode
    for p in prospectos:
        web_tag = "CON web" if p.tiene_web else "SIN web"
        emit("extracted", message=f"{p.nombre} | {web_tag}",
             nombre=p.nombre, telefono=p.telefono, tiene_web=p.tiene_web,
             progress=42 + int(len(prospectos) / max(total, 1) * 40))

    return prospectos


# ── File Logger ───────────────────────────────────────────────────────
LOG_PATH = ROOT / "logs_scraper.txt"

def setup_logger() -> logging.Logger:
    """Configure a logger that writes to both console and logs_scraper.txt."""
    logger = logging.getLogger("indexa_scraper")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    fmt = logging.Formatter("[%(asctime)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S")

    fh = logging.FileHandler(LOG_PATH, mode="a", encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    return logger


# ── Config loader ─────────────────────────────────────────────────────
CONFIG_PATH = ROOT / "config_busqueda.json"

def load_batch_config() -> list[dict]:
    """Load config_busqueda.json and return list of {query, categoria, ciudad}."""
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(
            f"No se encontró {CONFIG_PATH}.\n"
            "Crea el archivo con el formato:\n"
            '{\n  "categorias": ["Dentistas", "Restaurantes"],\n'
            '  "ciudades": ["CDMX", "Monterrey"],\n'
            '  "max_por_busqueda": 15\n}'
        )

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    categorias = cfg.get("categorias", [])
    ciudades = cfg.get("ciudades", [])
    max_per = cfg.get("max_por_busqueda", 15)

    if not categorias or not ciudades:
        raise ValueError("config_busqueda.json debe tener al menos una categoría y una ciudad.")

    queries = []
    for cat in categorias:
        for city in ciudades:
            queries.append({
                "query": f"{cat} en {city}",
                "categoria": cat,
                "ciudad": city,
                "max": max_per,
            })

    return queries


# ── Core scraping function (single query) ────────────────────────────
@dataclass
class QueryResult:
    query: str
    categoria: str
    ciudad: str
    total_extraidos: int = 0
    con_web: int = 0
    sin_web: int = 0
    subidos: int = 0
    omitidos: int = 0
    error: str = ""


def run_single_query(
    query_str: str,
    max_results: int,
    headless: bool,
    categoria: str,
    ciudad: str,
    token: str | None,
    existentes: set[str],
    output_path: Path | None = None,
) -> QueryResult:
    """Run a single scraping query and return results."""
    result = QueryResult(query=query_str, categoria=categoria, ciudad=ciudad)

    emit("start", message="=" * 60, query=query_str, max=max_results, categoria=categoria, ciudad=ciudad)
    if not _JSON_MODE:
        print(f"\n{'=' * 60}")
        print(f"  Búsqueda:   {query_str}")
        print(f"  Categoría:  {categoria}")
        print(f"  Ciudad:     {ciudad}")
        print(f"  Máximo:     {max_results}")
        print(f"{'=' * 60}")

    try:
        emit("phase", message="Iniciando navegador...", phase="browser", progress=15)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(
                headless=headless,
                args=[
                    "--lang=es-MX",
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                    "--disable-extensions",
                    "--disable-background-networking",
                    "--disable-default-apps",
                    "--disable-sync",
                    "--disable-translate",
                    "--no-first-run",
                    "--single-process",
                    "--renderer-process-limit=1",
                    "--disable-features=site-per-process,TranslateUI",
                    "--disable-component-extensions-with-background-pages",
                    "--disable-client-side-phishing-detection",
                    "--disable-ipc-flooding-protection",
                    "--js-flags=--max-old-space-size=128",
                ],
            )
            context = browser.new_context(
                locale="es-MX",
                geolocation={"latitude": 19.4326, "longitude": -99.1332},
                permissions=["geolocation"],
                viewport={"width": 800, "height": 450},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/131.0.0.0 Safari/537.36"
                ),
            )
            page = context.new_page()

            # Block ALL non-essential resources to minimize memory
            _ALLOWED_TYPES = {"document", "script", "xhr", "fetch"}
            def _block_heavy(route):
                if route.request.resource_type not in _ALLOWED_TYPES:
                    route.abort()
                else:
                    route.continue_()
            page.route("**/*", _block_heavy)

            emit("phase", message="Buscando en Google Maps...", phase="searching", progress=20)
            buscar_en_maps(page, query_str)

            emit("phase", message="Cargando resultados...", phase="scrolling", progress=30)
            total_visible = scroll_resultados(page, max_results)
            emit("phase", message=f"-> {total_visible} resultados visibles.",
                 phase="scroll_done", progress=40, total_visible=total_visible)

            todos_prospectos = extraer_prospectos_with_progress(page, max_results, total_visible)
            browser.close()

        # Classify
        sin_web = [p for p in todos_prospectos if not p.tiene_web]
        con_web_tel = [p for p in todos_prospectos if p.tiene_web and p.telefono]
        # Upload ALL with phone: sin_web (sell website) + con_web (sell ads)
        uploadable = [p for p in todos_prospectos if p.telefono]
        result.total_extraidos = len(todos_prospectos)
        result.con_web = len(con_web_tel)
        result.sin_web = len(sin_web)

        emit("phase", message=f"Extraidos: {result.total_extraidos} | Sin web: {result.sin_web} | Con web+tel: {result.con_web}",
             phase="filtered", progress=85, total=result.total_extraidos, sin_web=result.sin_web, con_web=result.con_web)

        # Save JSON
        if output_path:
            json_data = []
            for p in uploadable:
                d = asdict(p)
                d["categoria"] = categoria
                d["ciudad"] = ciudad
                json_data.append(d)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)

        # Upload to Firestore — all businesses with phone numbers
        if token and uploadable:
            emit("phase", message="Subiendo a Firestore...", phase="uploading", progress=88)
            nombres_subidos: set[str] = set()

            for idx, p in enumerate(uploadable):
                tel_limpio = limpiar_telefono(p.telefono)

                if tel_limpio and tel_limpio in existentes:
                    emit("upload_skip", message=f"Duplicado: {p.nombre}", nombre=p.nombre, reason="duplicate_phone")
                    result.omitidos += 1
                    continue

                slug_key = p.slug or generate_slug(p.nombre)
                if slug_key in nombres_subidos:
                    emit("upload_skip", message=f"Duplicado: {p.nombre}", nombre=p.nombre, reason="duplicate_name")
                    result.omitidos += 1
                    continue

                ok = subir_prospecto(token, p, categoria, ciudad)
                if ok:
                    if tel_limpio:
                        existentes.add(tel_limpio)
                    nombres_subidos.add(slug_key)
                    result.subidos += 1
                    web_tag = "CON web" if p.tiene_web else "SIN web"
                    emit("uploaded", message=f"+ {p.nombre} ({web_tag})", nombre=p.nombre, slug=p.slug, telefono=p.telefono,
                         tiene_web=p.tiene_web, progress=88 + int((idx + 1) / len(uploadable) * 10))
                else:
                    result.omitidos += 1

            emit("phase", message=f"{result.subidos} subidos, {result.omitidos} omitidos.",
                 phase="upload_done", progress=98, subidos=result.subidos, omitidos=result.omitidos)
        elif not token:
            emit("phase", message="Sin token, solo JSON local.", phase="no_token", progress=98)
        else:
            emit("phase", message="Sin prospectos validos para subir.", phase="no_results", progress=98)

    except Exception as e:
        result.error = str(e)
        emit("error", message=f"ERROR: {e}")

    emit("done", message="Scraping completado.",
         progress=100, total=result.total_extraidos, sin_web=result.sin_web, subidos=result.subidos)

    return result


# ── Main ──────────────────────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(
        description="INDEXA — Scraper de Google Maps v3 (REST API + Batch)"
    )
    parser.add_argument("query", nargs="?", default="", help="Búsqueda (ej: 'Dentistas en CDMX')")
    parser.add_argument("--batch", action="store_true", help="Modo batch: lee config_busqueda.json y ejecuta todas las combinaciones")
    parser.add_argument("--max", type=int, default=15, help="Máximo de resultados por búsqueda (default: 15)")
    parser.add_argument("--headless", default="true", choices=["true", "false"], help="Sin ventana (default: true)")
    parser.add_argument("--output", default="prospectos_output.json", help="Archivo JSON local de salida")
    parser.add_argument("--categoria", default="", help="Categoría manual (ej: 'Restaurantes')")
    parser.add_argument("--ciudad", default="", help="Ciudad manual (ej: 'CDMX')")
    parser.add_argument("--json-progress", action="store_true", help="Output JSON progress lines for API consumption")

    args = parser.parse_args()
    headless = args.headless == "true"

    global _JSON_MODE
    if args.json_progress:
        _JSON_MODE = True
        headless = True

    # Validate: need either a query or --batch
    if not args.batch and not args.query:
        parser.error("Debes proporcionar un query o usar --batch para modo autónomo.")

    # ── Setup logger ──────────────────────────────────────────────────
    log = setup_logger()
    start_time = datetime.now()
    log.info("=" * 60)
    log.info("INDEXA Scraper v3 — Inicio de ejecución")
    log.info(f"Modo: {'BATCH' if args.batch else 'SINGLE'}")
    log.info("=" * 60)

    # ── Authenticate once ─────────────────────────────────────────────
    emit("phase", message="Conectando a Firebase...", phase="auth", progress=5)
    token = authenticate()
    existentes: set[str] = set()
    if token:
        existentes = obtener_telefonos_existentes(token)
        log.info(f"Autenticado como: {AUTH_EMAIL} | {len(existentes)} prospectos existentes en Firestore.")
        emit("phase", message=f"Autenticado. {len(existentes)} prospectos existentes.", phase="auth_done", progress=10)
    else:
        log.warning("Sin autenticación. Los resultados solo se guardarán en JSON local.")
        emit("phase", message="Sin autenticación, solo JSON local.", phase="auth_fail", progress=10)

    # ── Build query list ──────────────────────────────────────────────
    if args.batch:
        try:
            queries = load_batch_config()
            log.info(f"Config cargada: {len(queries)} combinaciones de categoría × ciudad.")
        except (FileNotFoundError, ValueError) as e:
            log.error(str(e))
            print(f"\n  ERROR: {e}")
            return
    else:
        # Single query mode
        ciudad = args.ciudad
        if not ciudad:
            m = re.search(r"\ben\s+(.+)$", args.query, re.IGNORECASE)
            if m:
                ciudad = m.group(1).strip()
        categoria = args.categoria
        if not categoria:
            m = re.search(r"^(.+?)\s+en\b", args.query, re.IGNORECASE)
            if m:
                categoria = m.group(1).strip()

        queries = [{
            "query": args.query,
            "categoria": categoria,
            "ciudad": ciudad,
            "max": args.max,
        }]

    # ── Run queries ───────────────────────────────────────────────────
    results: list[QueryResult] = []
    total_queries = len(queries)

    for i, q in enumerate(queries, 1):
        log.info(f"\n--- [{i}/{total_queries}] {q['query']} ---")

        output = ROOT / args.output if not args.batch else None
        result = run_single_query(
            query_str=q["query"],
            max_results=q.get("max", args.max),
            headless=headless,
            categoria=q["categoria"],
            ciudad=q["ciudad"],
            token=token,
            existentes=existentes,
            output_path=output,
        )
        results.append(result)

        if result.error:
            log.error(f"  ERROR en '{q['query']}': {result.error}")
        else:
            log.info(f"  Extraidos: {result.total_extraidos} | Sin web: {result.sin_web} | Subidos: {result.subidos} | Omitidos: {result.omitidos}")

        # Small delay between queries to avoid rate limiting
        if i < total_queries:
            log.info("  Pausa de 5s antes de la siguiente búsqueda...")
            time.sleep(5)

    # ── Summary ───────────────────────────────────────────────────────
    elapsed = datetime.now() - start_time
    total_subidos = sum(r.subidos for r in results)
    total_sin_web = sum(r.sin_web for r in results)
    total_extraidos = sum(r.total_extraidos for r in results)
    total_errores = sum(1 for r in results if r.error)

    log.info("")
    log.info("=" * 60)
    log.info("RESUMEN FINAL")
    log.info("=" * 60)
    log.info(f"  Búsquedas ejecutadas:  {len(results)}")
    log.info(f"  Tiempo total:          {elapsed}")
    log.info(f"  Total extraídos:       {total_extraidos}")
    log.info(f"  Total sin web:         {total_sin_web}")
    log.info(f"  Total subidos:         {total_subidos}")
    log.info(f"  Errores:               {total_errores}")

    if total_errores > 0:
        log.info("")
        log.info("  Búsquedas con error:")
        for r in results:
            if r.error:
                log.info(f"    - {r.query}: {r.error}")

    log.info("=" * 60)
    log.info(f"Log guardado en: {LOG_PATH}")
    log.info("=" * 60)


if __name__ == "__main__":
    main()
