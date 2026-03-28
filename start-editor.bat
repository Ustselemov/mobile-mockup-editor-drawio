@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found.
  echo Install Node.js 20+ and run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm not found.
  echo Install Node.js 20+ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting editor...
echo If the browser does not open automatically, use http://localhost:5173
call npm run dev -- --open

if errorlevel 1 (
  echo Failed to start the editor.
  pause
  exit /b 1
)
