@echo off
setlocal enabledelayedexpansion
echo ================================================
echo   SIPMA Backend — Spring Boot Java Server
echo ================================================
echo.

:: Masuk ke folder backend
cd /d "%~dp0backend"

set "JAVA_HOME=C:\Program Files\Java\jdk-25"

:: Check if JAVA_HOME is already set
if not "%JAVA_HOME%"=="" (
    echo Using existing JAVA_HOME: %JAVA_HOME%
    goto run
)

:: Try to detect java.exe path automatically
for /f "tokens=*" %%i in ('where java') do (
    set "JAVA_PATH=%%~dpi"
    :: Remove the trailing backslash
    set "JAVA_PATH=!JAVA_PATH:~0,-1!"
    :: If the path ends with \bin, the parent directory is our JAVA_HOME
    if "!JAVA_PATH:~-4!"=="\bin" (
        set "JAVA_HOME=!JAVA_PATH:~0,-4!"
        echo Detected JAVA_HOME: !JAVA_HOME!
        goto run
    )
)

:run
if "%JAVA_HOME%"=="" (
    echo ERROR: Java is not in your PATH or JDK is not installed.
    echo Please install JDK and ensure 'java' is executable from CMD.
    pause
    exit /b 1
)

echo [INFO] Menjalankan Spring Boot Backend di http://localhost:8080
echo [INFO] Tekan Ctrl+C untuk menghentikan server.
echo.

call mvnw.cmd spring-boot:run
pause
