"""
INDEXA Scraper Service — FastAPI wrapper for Railway deployment.
Uses async jobs + polling instead of SSE streaming (Railway kills SSE connections).
"""

import asyncio
import json
import os
import uuid
import time
import shutil
from pathlib import Path

import logging

from fastapi import FastAPI, Header, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel

logger = logging.getLogger("indexa_scraper_service")
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")

app = FastAPI(title="INDEXA Scraper Service")

BUILD_VERSION = "2026-03-19-v6"
_BOOT_TIME = time.time()

FIREBASE_PROJECT_ID = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "")
CRON_SECRET = os.getenv("CRON_SECRET", "")
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://www.indexa.com.mx,https://indexa.com.mx,https://indexaia.com,https://www.indexaia.com,https://indexa-web-ten.vercel.app,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Track running batch jobs
_batch_running = False

SCRIPT_DIR = Path(__file__).resolve().parent
SCRAPER_SCRIPT = SCRIPT_DIR / "scraper_indexa.py"
FUNERARIAS_SCRIPT = SCRIPT_DIR / "scraper_funerarias.py"

# ── In-memory job store ──────────────────────────────────────────────
_jobs: dict[str, dict] = {}
MAX_JOBS = 20  # keep last N jobs in memory


def verify_firebase_token(token: str) -> dict | None:
    """Verify a Firebase ID token using Google's public keys."""
    if not FIREBASE_PROJECT_ID:
        return None
    try:
        decoded = id_token.verify_firebase_token(
            token, google_requests.Request(), audience=FIREBASE_PROJECT_ID
        )
        return decoded
    except Exception:
        return None


def _cleanup_old_jobs():
    """Remove oldest jobs if over MAX_JOBS."""
    if len(_jobs) <= MAX_JOBS:
        return
    sorted_ids = sorted(_jobs.keys(), key=lambda k: _jobs[k].get("created", 0))
    while len(_jobs) > MAX_JOBS:
        del _jobs[sorted_ids.pop(0)]


# ── Health / diagnostics ─────────────────────────────────────────────

@app.get("/health")
async def health():
    uptime = int(time.time() - _BOOT_TIME)
    return {"status": "ok", "project": FIREBASE_PROJECT_ID, "version": BUILD_VERSION, "uptime_s": uptime}


@app.get("/debug-memory")
async def debug_memory():
    """Show memory info for diagnosing OOM issues."""
    import resource
    
    # Cgroup memory limit (actual container limit)
    cgroup_limit_mb = -1
    cgroup_usage_mb = -1
    for limit_path in ["/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory/memory.limit_in_bytes"]:
        try:
            with open(limit_path) as f:
                val = f.read().strip()
                if val != "max" and val != "9223372036854771712":
                    cgroup_limit_mb = int(val) // (1024 * 1024)
                break
        except Exception:
            continue
    for usage_path in ["/sys/fs/cgroup/memory.current", "/sys/fs/cgroup/memory/memory.usage_in_bytes"]:
        try:
            with open(usage_path) as f:
                cgroup_usage_mb = int(f.read().strip()) // (1024 * 1024)
                break
        except Exception:
            continue
    
    # Current process RSS
    try:
        ru = resource.getrusage(resource.RUSAGE_SELF)
        rss_mb = ru.ru_maxrss // 1024  # Linux: KB -> MB
    except Exception:
        rss_mb = -1
    
    return {
        "container_limit_mb": cgroup_limit_mb,
        "container_usage_mb": cgroup_usage_mb,
        "process_rss_mb": rss_mb,
        "active_jobs": len([j for j in _jobs.values() if j["status"] == "running"]),
        "note": "container_limit_mb is the REAL memory limit for this Railway container",
    }


# ── Async scrape job endpoints ───────────────────────────────────────

class ScrapeRequest(BaseModel):
    query: str
    max: int = 30
    token: str


async def _run_scrape_job(job_id: str, query: str, max_results: int):
    """Background task: run scraper subprocess, capture progress into _jobs."""
    job = _jobs[job_id]
    try:
        args = [
            "python", str(SCRAPER_SCRIPT),
            query,
            "--max", str(max_results),
            "--headless", "true",
            "--json-progress",
        ]
        logger.info(f"[job:{job_id}] Starting: {query} (max={max_results})")

        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(SCRIPT_DIR),
        )
        job["pid"] = proc.pid

        buffer = ""
        while True:
            try:
                chunk = await asyncio.wait_for(proc.stdout.read(4096), timeout=300)
            except asyncio.TimeoutError:
                job["status"] = "error"
                job["error"] = "Timeout: el scraper tardó más de 5 minutos sin enviar datos."
                proc.kill()
                break
            if not chunk:
                break
            buffer += chunk.decode("utf-8", errors="replace")
            lines = buffer.split("\n")
            buffer = lines.pop()
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                try:
                    evt = json.loads(line)
                    # Update job progress
                    if evt.get("progress") is not None:
                        job["progress"] = evt["progress"]
                    if evt.get("message"):
                        job["message"] = evt["message"]
                    if evt.get("event") == "done":
                        job["result"] = evt
                    # Keep last 30 log lines
                    job["log"].append(evt.get("message", line)[:200])
                    if len(job["log"]) > 30:
                        job["log"] = job["log"][-30:]
                except (json.JSONDecodeError, ValueError):
                    pass

        # Process remaining buffer
        if buffer.strip():
            try:
                evt = json.loads(buffer.strip())
                if evt.get("event") == "done":
                    job["result"] = evt
                if evt.get("progress") is not None:
                    job["progress"] = evt["progress"]
                if evt.get("message"):
                    job["message"] = evt["message"]
            except (json.JSONDecodeError, ValueError):
                pass

        # Capture stderr
        try:
            stderr_data = await asyncio.wait_for(proc.stderr.read(), timeout=5)
            if stderr_data:
                job["stderr"] = stderr_data.decode("utf-8", errors="replace").strip()[-500:]
        except asyncio.TimeoutError:
            pass

        await proc.wait()
        job["exit_code"] = proc.returncode

        if job["status"] != "error":
            if proc.returncode == 0:
                job["status"] = "done"
                job["progress"] = 100
                logger.info(f"[job:{job_id}] Completed successfully")
            else:
                job["status"] = "error"
                job["error"] = job.get("stderr", f"Exit code {proc.returncode}")[:300]
                logger.error(f"[job:{job_id}] Failed: exit={proc.returncode}")

    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)[:300]
        logger.error(f"[job:{job_id}] Exception: {e}")

    job["finished_at"] = time.time()


VALID_VERTICALS_API = {"funeraria", "veterinaria", "hospicio", "geriatrico"}


class FunerariasScrapeRequest(BaseModel):
    ciudad: str
    max: int = 15
    dry_run: bool = False
    token: str
    vertical: str = "funeraria"   # funeraria | veterinaria | hospicio | geriatrico


async def _run_funerarias_job(
    job_id: str,
    ciudad: str,
    max_results: int,
    dry_run: bool,
    vertical: str = "funeraria",
):
    """Background task: corre scraper_funerarias.py como subprocess y recolecta eventos JSON."""
    job = _jobs[job_id]
    try:
        args = [
            "python", str(FUNERARIAS_SCRIPT),
            "--vertical", vertical,
            "--ciudad", ciudad,
            "--max", str(max_results),
            "--json-progress",
        ]
        if dry_run:
            args.append("--dry-run")
        logger.info(f"[job:{job_id}] B2B start: vertical={vertical} ciudad='{ciudad}' max={max_results} dry_run={dry_run}")

        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(SCRIPT_DIR),
        )
        job["pid"] = proc.pid

        buffer = ""
        while True:
            try:
                chunk = await asyncio.wait_for(proc.stdout.read(4096), timeout=900)
            except asyncio.TimeoutError:
                job["status"] = "error"
                job["error"] = "Timeout: scraper de funerarias tardó más de 15 min sin datos."
                proc.kill()
                break
            if not chunk:
                break
            buffer += chunk.decode("utf-8", errors="replace")
            lines = buffer.split("\n")
            buffer = lines.pop()
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                try:
                    evt = json.loads(line)
                    if evt.get("progress") is not None:
                        job["progress"] = evt["progress"]
                    if evt.get("message"):
                        job["message"] = evt["message"]
                    if evt.get("event") == "done":
                        job["result"] = evt
                    job["log"].append(evt.get("message", line)[:200])
                    if len(job["log"]) > 30:
                        job["log"] = job["log"][-30:]
                except (json.JSONDecodeError, ValueError):
                    pass

        if buffer.strip():
            try:
                evt = json.loads(buffer.strip())
                if evt.get("event") == "done":
                    job["result"] = evt
                if evt.get("progress") is not None:
                    job["progress"] = evt["progress"]
                if evt.get("message"):
                    job["message"] = evt["message"]
            except (json.JSONDecodeError, ValueError):
                pass

        try:
            stderr_data = await asyncio.wait_for(proc.stderr.read(), timeout=5)
            if stderr_data:
                job["stderr"] = stderr_data.decode("utf-8", errors="replace").strip()[-500:]
        except asyncio.TimeoutError:
            pass

        await proc.wait()
        job["exit_code"] = proc.returncode

        if job["status"] != "error":
            if proc.returncode == 0:
                job["status"] = "done"
                job["progress"] = 100
                logger.info(f"[job:{job_id}] Funerarias completed successfully")
            else:
                job["status"] = "error"
                job["error"] = job.get("stderr", f"Exit code {proc.returncode}")[:300]
                logger.error(f"[job:{job_id}] Funerarias failed: exit={proc.returncode}")

    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)[:300]
        logger.error(f"[job:{job_id}] Funerarias exception: {e}")

    job["finished_at"] = time.time()


@app.post("/scrape-funerarias-async")
async def scrape_funerarias_async(body: FunerariasScrapeRequest):
    """
    Arranca un scrape de funerarias para UNA ciudad. El scraper:
      - Llama a HI /optouts para filtrar la blocklist
      - Busca "funeraria en <ciudad>" en Google Maps
      - Registra cada match en HI vía /api/leads/funeraria (obtiene token + link)
      - Guarda en Firestore funeraria_leads con status=pendiente_envio

    Respuesta: {job_id} — se consulta estado con /scrape-status/{job_id}.
    """
    user = verify_firebase_token(body.token)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")

    if not FUNERARIAS_SCRIPT.exists():
        raise HTTPException(status_code=500, detail="scraper_funerarias.py no encontrado.")

    ciudad = body.ciudad.strip()
    if not ciudad or len(ciudad) > 80:
        raise HTTPException(status_code=400, detail="Ciudad inválida.")

    vertical = (body.vertical or "funeraria").strip().lower()
    if vertical not in VALID_VERTICALS_API:
        raise HTTPException(
            status_code=400,
            detail=f"Vertical inválida. Usa una de: {sorted(VALID_VERTICALS_API)}",
        )

    effective_max = min(max(body.max, 1), 50)

    job_id = uuid.uuid4().hex[:12]
    _jobs[job_id] = {
        "status": "running",
        "query": f"{vertical} en {ciudad}",
        "max": effective_max,
        "progress": 0,
        "message": f"Iniciando scraper de {vertical}s...",
        "log": [],
        "result": None,
        "error": None,
        "stderr": None,
        "exit_code": None,
        "pid": None,
        "created": time.time(),
        "finished_at": None,
        "kind": vertical,
    }
    _cleanup_old_jobs()

    asyncio.create_task(_run_funerarias_job(job_id, ciudad, effective_max, body.dry_run, vertical))

    return {
        "job_id": job_id,
        "status": "running",
        "vertical": vertical,
        "ciudad": ciudad,
        "max": effective_max,
        "dry_run": body.dry_run,
    }


@app.post("/scrape-async")
async def scrape_async(body: ScrapeRequest):
    """Start a scrape job in the background. Returns job_id to poll."""
    # Validate Firebase token
    user = verify_firebase_token(body.token)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")

    if not SCRAPER_SCRIPT.exists():
        raise HTTPException(status_code=500, detail="scraper_indexa.py not found.")

    # Cap max at 50
    effective_max = min(max(body.max, 1), 50)

    job_id = uuid.uuid4().hex[:12]
    _jobs[job_id] = {
        "status": "running",
        "query": body.query,
        "max": effective_max,
        "progress": 0,
        "message": "Iniciando scraper...",
        "log": [],
        "result": None,
        "error": None,
        "stderr": None,
        "exit_code": None,
        "pid": None,
        "created": time.time(),
        "finished_at": None,
    }
    _cleanup_old_jobs()

    # Fire and forget
    asyncio.create_task(_run_scrape_job(job_id, body.query, effective_max))

    return {"job_id": job_id, "status": "running", "max": effective_max}


@app.get("/scrape-status/{job_id}")
async def scrape_status(job_id: str):
    """Poll job progress. Returns current status, progress %, message, and result when done."""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job no encontrado. El servidor pudo haberse reiniciado por falta de memoria (OOM). Intenta de nuevo.",
        )

    return {
        "job_id": job_id,
        "status": job["status"],
        "progress": job["progress"],
        "message": job["message"],
        "log": job["log"],
        "result": job["result"],
        "error": job["error"],
        "exit_code": job["exit_code"],
    }


# ── Legacy SSE endpoint (kept for local dev compatibility) ───────────

@app.get("/scrape")
async def scrape_legacy():
    """Legacy endpoint — redirects to use /scrape-async instead."""
    return JSONResponse(
        {"error": "Este endpoint fue reemplazado. Usa POST /scrape-async + GET /scrape-status/{job_id}."},
        status_code=410,
    )


# ── Batch endpoint (called by Vercel Cron) ────────────────────────────

async def _run_batch(queries: list[dict], max_per: int):
    """Background task: run scraper for each query sequentially."""
    global _batch_running
    _batch_running = True
    total_queries = len(queries)
    total_uploaded = 0
    total_errors = 0

    logger.info(f"=== BATCH START: {total_queries} queries, max {max_per} each ===")

    for i, q in enumerate(queries, 1):
        query_str = q["query"]
        logger.info(f"[{i}/{total_queries}] Running: {query_str}")
        try:
            proc = await asyncio.create_subprocess_exec(
                "python",
                str(SCRAPER_SCRIPT),
                query_str,
                "--max", str(max_per),
                "--headless", "true",
                "--json-progress",
                "--categoria", q.get("categoria", ""),
                "--ciudad", q.get("ciudad", ""),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(SCRIPT_DIR),
            )

            stdout, stderr = await proc.communicate()

            # Parse last JSON line for stats
            lines = stdout.decode("utf-8", errors="replace").strip().split("\n")
            for line in reversed(lines):
                try:
                    data = json.loads(line)
                    if data.get("event") == "done":
                        total_uploaded += data.get("subidos", 0)
                        logger.info(f"  -> {data.get('subidos', 0)} uploaded, {data.get('sin_web', 0)} sin web")
                        break
                except (json.JSONDecodeError, ValueError):
                    continue

            if proc.returncode != 0:
                total_errors += 1
                err_text = stderr.decode("utf-8", errors="replace").strip()[:200]
                logger.error(f"  -> Exit code {proc.returncode}: {err_text}")

        except Exception as e:
            total_errors += 1
            logger.error(f"  -> Exception: {e}")

    logger.info(f"=== BATCH DONE: {total_uploaded} total uploaded, {total_errors} errors ===")
    _batch_running = False


@app.post("/batch")
async def batch(
    request: Request,
    background_tasks: BackgroundTasks,
    authorization: str = Header(""),
):
    """Start a batch scraping job. Secured with CRON_SECRET."""
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    if not CRON_SECRET or token != CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid CRON_SECRET.")

    if _batch_running:
        return JSONResponse(
            {"status": "already_running", "message": "A batch job is already in progress."},
            status_code=409,
        )

    if not SCRAPER_SCRIPT.exists():
        raise HTTPException(status_code=500, detail="scraper_indexa.py not found.")

    try:
        body = await request.json()
    except Exception:
        body = {}

    categorias = body.get("categorias", [
        "Restaurantes", "Dentistas", "Talleres mecánicos",
        "Estéticas y salones de belleza", "Tortillerías",
        "Veterinarias", "Papelerías", "Gimnasios",
    ])
    ciudades = body.get("ciudades", [
        "Chalco", "Texcoco", "Ixtapaluca",
        "Los Reyes La Paz", "Chicoloapan", "Chimalhuacán",
    ])
    max_per = body.get("max_por_busqueda", 15)

    queries = []
    for cat in categorias:
        for city in ciudades:
            queries.append({"query": f"{cat} en {city}", "categoria": cat, "ciudad": city})

    background_tasks.add_task(_run_batch, queries, max_per)

    return JSONResponse(
        {
            "status": "started",
            "total_queries": len(queries),
            "max_per_query": max_per,
            "message": f"Batch job started with {len(queries)} queries.",
        },
        status_code=202,
    )


@app.get("/batch/status")
async def batch_status():
    return {"running": _batch_running}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
