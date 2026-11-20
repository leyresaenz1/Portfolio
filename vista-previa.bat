@echo off
cd /d "%~dp0"
echo Vista previa en http://localhost:8000  (cierra esta ventana para detenerla)
start "" http://localhost:8000
py -m http.server 8000
