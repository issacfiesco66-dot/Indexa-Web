# INDEXA — Automatización del Scraper con el Programador de Tareas de Windows

## Requisitos previos

Antes de automatizar, verifica que el scraper funciona correctamente de forma manual:

```powershell
cd E:\Indexa
python scraper_indexa.py --batch
```

Si ves el resumen final sin errores, estás listo para automatizar.

---

## Paso 1: Crear el archivo .bat de ejecución

Crea un archivo llamado `ejecutar_scraper.bat` en `E:\Indexa\` con este contenido:

```bat
@echo off
cd /d E:\Indexa
python scraper_indexa.py --batch
```

> **Nota:** Si tu instalación de Python no está en el PATH del sistema, usa la ruta completa:
> ```bat
> C:\Users\Issac\AppData\Local\Programs\Python\Python312\python.exe scraper_indexa.py --batch
> ```

### Probar el .bat

Haz doble clic en `ejecutar_scraper.bat`. Debería abrir una ventana de terminal, ejecutar el scraper, y cerrarse al terminar. Revisa `logs_scraper.txt` para confirmar que se ejecutó correctamente.

---

## Paso 2: Abrir el Programador de Tareas

1. Presiona **Win + R**
2. Escribe `taskschd.msc` y presiona **Enter**
3. Se abrirá el **Programador de tareas de Windows**

---

## Paso 3: Crear una nueva tarea

1. En el panel derecho, haz clic en **"Crear tarea básica..."**
2. **Nombre:** `INDEXA Scraper Diario`
3. **Descripción:** `Ejecuta el scraper de Google Maps para encontrar negocios sin presencia digital`
4. Clic en **Siguiente**

---

## Paso 4: Configurar el desencadenador (cuándo se ejecuta)

1. Selecciona **"Diariamente"**
2. Clic en **Siguiente**
3. **Hora de inicio:** `9:00:00 AM`
4. **Repetir cada:** `1 día`
5. Clic en **Siguiente**

---

## Paso 5: Configurar la acción (qué se ejecuta)

1. Selecciona **"Iniciar un programa"**
2. Clic en **Siguiente**
3. En **"Programa o script"**, haz clic en **Examinar** y selecciona:
   ```
   E:\Indexa\ejecutar_scraper.bat
   ```
4. En **"Iniciar en (opcional)"**, escribe:
   ```
   E:\Indexa
   ```
5. Clic en **Siguiente**

---

## Paso 6: Finalizar

1. Marca la casilla **"Abrir el diálogo Propiedades para esta tarea cuando haga clic en Finalizar"**
2. Clic en **Finalizar**

---

## Paso 7: Configuración avanzada (recomendada)

En el diálogo de Propiedades que se abrió:

### Pestaña "General"
- Marca: **"Ejecutar tanto si el usuario inició sesión como si no"**
- Marca: **"Ejecutar con los privilegios más altos"**
- Te pedirá tu contraseña de Windows — ingrésala

### Pestaña "Condiciones"
- **Desmarca:** "Iniciar la tarea solo si el equipo está conectado a corriente alterna"
  (para que funcione también con batería si usas laptop)

### Pestaña "Configuración"
- Marca: **"Si se produce un error en la tarea, reiniciar cada: 5 minutos"**
- **Intentar reiniciar hasta:** `3 veces`
- Marca: **"Detener la tarea si se ejecuta durante más de: 2 horas"**
  (evita que el scraper se quede colgado indefinidamente)

Clic en **Aceptar**.

---

## Paso 8: Probar la tarea

1. En el Programador de tareas, busca tu tarea **"INDEXA Scraper Diario"** en la lista
2. Haz clic derecho → **"Ejecutar"**
3. Espera unos minutos y revisa el archivo `E:\Indexa\logs_scraper.txt`

---

## Verificar que funciona

Después de la primera ejecución automática (al día siguiente a las 9 AM), revisa:

```powershell
# Ver las últimas líneas del log
Get-Content E:\Indexa\logs_scraper.txt -Tail 30
```

Deberías ver algo como:

```
[2026-03-17 09:00:05] ============================================================
[2026-03-17 09:00:05] INDEXA Scraper v3 — Inicio de ejecución
[2026-03-17 09:00:05] Modo: BATCH
[2026-03-17 09:00:05] ============================================================
[2026-03-17 09:00:06] Autenticado como: djonny319@gmail.com | 42 prospectos existentes en Firestore.
[2026-03-17 09:00:06] Config cargada: 48 combinaciones de categoría × ciudad.
...
[2026-03-17 09:45:12] ============================================================
[2026-03-17 09:45:12] RESUMEN FINAL
[2026-03-17 09:45:12] ============================================================
[2026-03-17 09:45:12]   Búsquedas ejecutadas:  48
[2026-03-17 09:45:12]   Tiempo total:          0:45:07
[2026-03-17 09:45:12]   Total extraídos:       312
[2026-03-17 09:45:12]   Total sin web:         187
[2026-03-17 09:45:12]   Total subidos:         156
[2026-03-17 09:45:12]   Errores:               2
[2026-03-17 09:45:12] ============================================================
```

---

## Personalizar las búsquedas

Edita `config_busqueda.json` para cambiar las categorías y ciudades:

```json
{
  "categorias": [
    "Restaurantes",
    "Dentistas",
    "Talleres mecánicos",
    "Estéticas y salones de belleza"
  ],
  "ciudades": [
    "Chalco",
    "Texcoco",
    "Ixtapaluca"
  ],
  "max_por_busqueda": 15
}
```

- **categorias × ciudades** = total de búsquedas (4 × 3 = 12 búsquedas)
- **max_por_busqueda** = cuántos negocios revisar por cada búsqueda
- El scraper descarta automáticamente los que ya tienen sitio web y los duplicados

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| La tarea no se ejecuta | Verifica que escribiste bien la ruta del .bat en el Programador |
| Error de Python no encontrado | Usa la ruta completa a python.exe en el .bat |
| No aparecen prospectos nuevos | Revisa `logs_scraper.txt` para ver si hubo errores |
| El log dice "Sin autenticación" | Verifica que `.env.local` tiene `SCRAPER_EMAIL` y `SCRAPER_PASSWORD` |
| El scraper se cuelga | El límite de 2 horas en la configuración lo detendrá automáticamente |
| Google Maps bloquea las búsquedas | Reduce `max_por_busqueda` a 10 y agrega más variedad de ciudades |

---

## Resumen

| Qué | Dónde |
|-----|-------|
| Script principal | `E:\Indexa\scraper_indexa.py` |
| Configuración de búsquedas | `E:\Indexa\config_busqueda.json` |
| Archivo .bat | `E:\Indexa\ejecutar_scraper.bat` |
| Logs de ejecución | `E:\Indexa\logs_scraper.txt` |
| Prospectos encontrados | Panel admin → `/admin/prospectos` |
