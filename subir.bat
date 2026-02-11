@echo off
echo ==========================================
echo      Sincronizando con GitHub...
echo ==========================================
echo.

:: 1. BAJAR CAMBIOS (PULL)
echo --- Bajando cambios de la nube...
git pull origin main
echo.

:: 2. PREPARAR CAMBIOS (ADD)
echo --- Preparando archivos...
git add .

:: 3. GUARDAR (COMMIT)
:ask_message
set /p "mensaje=Escribe tu comentario para este cambio: "
if "%mensaje%"=="" goto ask_message

git commit -m "%mensaje%"
echo.

:: 4. SUBIR (PUSH)
echo --- Subiendo a GitHub...
git push origin main

echo.
echo ==========================================
echo      !LISTO! Todo actualizado.
echo ==========================================
pause