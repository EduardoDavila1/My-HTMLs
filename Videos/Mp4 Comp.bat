@echo off
if not exist "mp4_comprimidos" mkdir "mp4_comprimidos"
for %%i in (*.mp4) do (
    echo Comprimiendo: %%i...
    ffmpeg -i "%%i" -vcodec libx264 -crf 28 -preset faster -acodec aac -b:a 128k "mp4_comprimidos\%%~ni_comp.mp4"
)
pause
