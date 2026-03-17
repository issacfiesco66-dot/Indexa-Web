# INDEXA Scraper Service

Microservicio FastAPI que ejecuta el scraper de Google Maps.  
Diseñado para desplegarse en **Railway** (Python + Playwright + Chromium).

## Despliegue en Railway

### 1. Crear cuenta y proyecto

1. Ve a [railway.app](https://railway.app) e inicia sesión con GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona el repo `Indexa-Web`
4. En **Settings → Root Directory**, escribe: `scraper-service`
5. Railway detectará el `Dockerfile` automáticamente

### 2. Variables de entorno

En Railway → tu servicio → **Variables**, agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `indexa-74005` | ID del proyecto Firebase |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *(tu API key de Firebase)* | Para Firestore REST API |
| `SCRAPER_EMAIL` | *(email del scraper)* | Cuenta Firebase para autenticación |
| `SCRAPER_PASSWORD` | *(password del scraper)* | Password de la cuenta scraper |
| `CORS_ORIGINS` | `https://www.indexa.com.mx,https://indexa.com.mx` | Dominios permitidos |

### 3. Obtener la URL del servicio

Una vez desplegado, Railway te dará una URL pública como:
```
https://indexa-scraper-production-XXXX.up.railway.app
```

### 4. Configurar Vercel

En Vercel → tu proyecto → **Settings → Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SCRAPER_URL` | `https://tu-servicio.up.railway.app` |

Haz un **redeploy** en Vercel para que tome la nueva variable.

### 5. Verificar

- Abre `https://tu-servicio.up.railway.app/health` — debe retornar `{"status": "ok"}`
- Abre tu dashboard INDEXA y prueba el buscador de prospectos

## Desarrollo local

```bash
cd scraper-service
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload --port 8000
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/scrape?query=...&max=20&token=...` | Ejecuta scraper con SSE streaming |
