@echo off
echo Stopping any process on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr LISTENING 2^>nul') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo Starting backend on port 3000...
set PORT=3000
npm run dev:next
