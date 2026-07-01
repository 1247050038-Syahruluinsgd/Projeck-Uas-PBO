@echo off
echo ================================================
echo   SIPMA AI — Deteksi Atribut (FastAPI + YOLO)
echo ================================================
echo.

:: Masuk ke folder AI
cd /d "%~dp0deteksi-atribut-ai"

:: Cek apakah Python tersedia
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python tidak ditemukan di PATH.
    echo [ERROR] Install Python 3.10+ dan pastikan ada di PATH.
    pause
    exit /b 1
)

:: Cek apakah uvicorn tersedia
python -m uvicorn --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Menginstall dependencies dari requirements.txt...
    pip install -r requirements.txt
)

echo [INFO] Menjalankan AI API Server di http://0.0.0.0:8000
echo [INFO] Dokumentasi Swagger: http://localhost:8000/docs
echo [INFO] Tekan Ctrl+C untuk menghentikan server.
echo.

python -m uvicorn detection_api:app --host 0.0.0.0 --port 8000 --reload

pause
