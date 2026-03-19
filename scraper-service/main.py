"""
INDEXA Scraper Service — FastAPI wrapper for Railway deployment.
Runs scraper_indexa.py as subprocess and streams SSE progress events.
"""

import asyncio
import json
import os
from pathlib import Path

import logging

from fastapi import FastAPI, Query, Header, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

logger = logging.getLogger("indexa_scraper_service")
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")

app = FastAPI(title="INDEXA Scraper Service")

FIREBASE_PROJECT_ID = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "")
CRON_SECRET = os.getenv("CRON_SECRET", "")
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://www.indexa.com.mx,https://indexa.com.mx,https://indexa-web-ten.vercel.app,http://localhost:3000",
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


@app.get("/health")
async def health():
    return {"status": "ok", "project": FIREBASE_PROJECT_ID}


@app.get("/scrape")
async def scrape(
    query: str = Query(..., min_length=3, description="Search query for Google Maps"),
    max: int = Query(20, ge=1, le=100, description="Max results"),
    token: str = Query("", description="Firebase ID token"),
):
    # Validate Firebase token
    user = verify_firebase_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")

    if not SCRAPER_SCRIPT.exists():
        raise HTTPException(status_code=500, detail="scraper_indexa.py not found.")

    async def generate():
        proc = await asyncio.create_subprocess_exec(
            "python",
            str(SCRAPER_SCRIPT),
            query,
            "--max",
            str(max),
            "--headless",
            "true",
            "--json-progress",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(SCRIPT_DIR),
        )

        buffer = ""
        while True:
            chunk = await proc.stdout.read(4096)
            if not chunk:
                break
            buffer += chunk.decode("utf-8", errors="replace")
            lines = buffer.split("\n")
            buffer = lines.pop()
            for line in lines:
                if line.strip():
                    yield f"data: {line}\n\n"

        if buffer.strip():
            yield f"data: {buffer}\n\n"

        # Capture stderr
        stderr_data = await proc.stderr.read()
        if stderr_data:
            stderr_text = stderr_data.decode("utf-8", errors="replace").strip()
            if stderr_text:
                for err_line in stderr_text.split("\n"):
                    if err_line.strip():
                        err_event = json.dumps(
                            {"event": "log", "message": err_line.strip()}
                        )
                        yield f"data: {err_event}\n\n"

        await proc.wait()

        end_event = json.dumps(
            {"event": "stream_end", "exitCode": proc.returncode}
        )
        yield f"data: {end_event}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
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
    # Auth: check Bearer <CRON_SECRET>
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

    # Accept config from body or use defaults
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
