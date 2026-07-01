@echo off
echo ================================================
echo   SIPMA Frontend — React + Vite Dev Server
echo ================================================
echo.

:: Masuk ke folder frontend
cd /d "%~dp0frontend"

:: Cek apakah node_modules sudah ada
if not exist "node_modules" (
    echo [INFO] node_modules tidak ditemukan. Menjalankan npm install...
    npm install
)

echo [INFO] Menjalankan Frontend di http://localhost:3000
echo [INFO] Tekan Ctrl+C untuk menghentikan server.
echo.

npm run dev

pause
