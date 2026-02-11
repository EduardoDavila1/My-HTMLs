@echo off
title Convertidor y Organizador MP4 a WebM
echo Iniciando proceso de limpieza y conversion...
echo.

:: Crear carpetas si no existen
if not exist "convertidos" mkdir "convertidos"
if not exist "old" mkdir "old"

for %%i in (*.mp4) do (
    echo ------------------------------------------
    echo Procesando: %%i
    echo ------------------------------------------

    :: Ejecutar la conversion con FFmpeg
    ffmpeg -i "%%i" -c:v libvpx-vp9 -crf 15 -b:v 0 -an "convertidos\%%~ni.webm"

    :: Comprobar si FFmpeg termino correctamente (ErrorLevel 0)
    if %ERRORLEVEL% equ 0 (
        echo [OK] Conversion exitosa. Moviendo original a "old"...
        move "%%i" "old\"
    ) else (
        echo [ERROR] Hubo un problema con %%i. El archivo original se queda aqui.
    )
)

echo.
echo ------------------------------------------
echo ¡Proceso terminado!
echo Revisa las carpetas "convertidos" y "old".
pause