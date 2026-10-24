@echo off
REM Sovereign Budget - Windows Launcher
REM Starts local server to grant unrestricted origin-bound storage access.

cd /d "%~dp0"
set PORT=8000
set URL=http://127.0.0.1:%PORT%

echo ==========================================================
echo  Starting Sovereign Budget with Local Storage Access...
echo ==========================================================

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching via Node.js server...
    node serve.js %PORT%
    goto end
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching via Python 3...
    start "" "%URL%"
    python -m http.server %PORT%
    goto end
)

echo No Node or Python found. Opening index.html directly...
start "" index.html

:end
