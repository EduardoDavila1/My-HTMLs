@echo off
title Convertidor MP4 a WebM (Optimizado con Audio)
echo Iniciando proceso de limpieza y conversion...
echo.

:: Crear carpetas si no existen
if not exist "convertidos" mkdir "convertidos"
if not exist "old" mkdir "old"

:: Usamos exactamente tu estructura de bucle
for %%i in (*.mp4) do (
    echo ------------------------------------------
    echo Procesando: %%i
    echo ------------------------------------------
    
    :: Ejecutar la conversion con los parametros de compresion y audio
    ffmpeg -i "%%i" -vf "scale=iw/2:-1" -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 64k "convertidos\%%~ni.webm"
    
    :: Comprobar si FFmpeg termino correctamente usando tu logica de ErrorLevel
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
