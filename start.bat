@echo off
title Member Management System

echo ==========================================
echo     Member Management System - Launcher
echo ==========================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed.
    echo        Download: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js installed
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo      Version: %NODE_VERSION%
echo.

echo [INFO] Checking npm availability...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not available.
    pause
    exit /b 1
)
echo [OK] npm installed
echo.

echo [INFO] Installing dependencies...
call npm.cmd install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [INFO] Starting backend server (port: 3001)...
start "Backend" cmd /k "npm.cmd run dev:backend"
timeout /t 3 /nobreak >nul
echo.

echo [INFO] Starting frontend dev server (port: 5173)...
start "Frontend" cmd /k "npm.cmd run dev:frontend"
timeout /t 3 /nobreak >nul
echo.

echo ==========================================
echo     Services started successfully!
echo ==========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Test accounts:
echo   Admin:   admin / 123456
echo   Member1: member1 / 123456
echo   Member2: member2 / 123456
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:5173