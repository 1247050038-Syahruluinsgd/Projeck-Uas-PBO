@echo off
setlocal enabledelayedexpansion

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

echo Starting Spring Boot backend...
call mvnw.cmd spring-boot:run
pause
