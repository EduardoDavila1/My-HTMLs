@echo off
echo ==========================================
echo      MODO TURBO: Sincronizando...
echo ==========================================

:: 1. PULL
git pull origin main

:: 2. ADD
git add .

:: 3. COMMIT (Con Fecha y Hora)
:: Obtiene la fecha y hora actual para el mensaje
set fecha=%date% %time%
git commit -m "Actualizacion automatica: %fecha%"

:: 4. PUSH
git push origin main

echo.
echo !TERMINADO!
pause