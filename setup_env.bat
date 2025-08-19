@echo off
REM AI Hackathon Environment Setup for Windows
REM This batch file helps you set up your environment variables.

echo.
echo ========================================
echo    AI Hackathon Environment Setup
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Please run this script from the AI Hackathon root directory
    echo Expected structure:
    echo AI Hackathon/
    echo ├── backend/
    echo ├── frontend/
    echo └── setup_env.bat
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Please run this script from the AI Hackathon root directory
    echo Expected structure:
    echo AI Hackathon/
    echo ├── backend/
    echo ├── frontend/
    echo └── setup_env.bat
    pause
    exit /b 1
)

echo ✅ Directory structure looks good
echo.

REM Run the Python setup script
echo 🚀 Running automated environment setup...
python setup_env.py

if errorlevel 1 (
    echo.
    echo ❌ Setup failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Install backend dependencies: cd backend ^&^& pip install -r requirements.txt
echo 2. Install frontend dependencies: cd frontend ^&^& npm install
echo 3. Start MongoDB service
echo 4. Run backend: cd backend ^&^& uvicorn app.main:app --reload
echo 5. Run frontend: cd frontend ^&^& npm run dev
echo.
echo Press any key to exit...
pause >nul
