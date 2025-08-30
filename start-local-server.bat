@echo off
title Stellaris Tech Tree Local Server
echo ==========================================
echo    Stellaris Tech Tree Local Server
echo ==========================================
echo.
echo Starting local development server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python HTTP Server on port 8000
    echo.
    echo Open your browser to: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Python not found, checking for Node.js...
        npx --version >nul 2>&1
        if %errorlevel% == 0 (
            echo Using npx live-server on port 8080
            echo.
            echo Open your browser to: http://localhost:8080
            echo.
            npx live-server --port=8080 --open=/index.html
        ) else (
            echo Node.js found but npx not available.
            echo Installing live-server...
            npm install -g live-server
            live-server --port=8080 --open=/index.html
        )
    ) else (
        echo Neither Python nor Node.js found.
        echo Opening with default browser instead...
        echo.
        echo For better functionality, install Python 3 or Node.js
        echo.
        start "" "index.html"
        pause
    )
)
