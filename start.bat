@echo off
echo Stopping existing Flowora servers on ports 3000 and 8000...

:: Kill process on port 8000 (Backend)
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :8000') DO (
    taskkill /F /PID %%T >nul 2>&1
)

:: Kill process on port 3000 (Frontend)
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :3000') DO (
    taskkill /F /PID %%T >nul 2>&1
)

echo Starting Flowora Backend and Frontend...

:: Start Backend in a new window
start "Flowora Backend" cmd /k "cd backend && .\.venv\Scripts\uvicorn.exe app.main:app --reload"

:: Start Frontend in a new window
start "Flowora Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting in separate windows.
