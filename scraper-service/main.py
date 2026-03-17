"""
INDEXA Scraper Service — FastAPI wrapper for Railway deployment.
Runs scraper_indexa.py as subprocess and streams SSE progress events.
"""

import asyncio
import json
import os
from pathlib import Path

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

app = FastAPI(title="INDEXA Scraper Service")

FIREBASE_PROJECT_ID = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "")
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://www.indexa.com.mx,https://indexa.com.mx,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
