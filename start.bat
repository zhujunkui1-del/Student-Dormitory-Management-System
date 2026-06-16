@echo off
chcp 65001 >nul
title 宿舍管理系统

echo.
echo   ╔══════════════════════════════╗
echo   ║     🏠 宿舍管理系统        ║
echo   ╚══════════════════════════════╝
echo.

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   ❌ 未找到 Node.js，请先安装 Node.js
    echo   📥 下载地址: https://nodejs.org
    pause
    exit /b 1
)
echo   ✅ Node.js 已就绪

:: 检查 Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo   ❌ 未找到 Python，请先安装 Python 3
    echo   📥 下载地址: https://python.org
    pause
    exit /b 1
)
echo   ✅ Python 已就绪

:: 检查 pyodbc
python -c "import pyodbc" >nul 2>nul
if %errorlevel% neq 0 (
    echo   📦 正在安装 pyodbc...
    pip install pyodbc
    if %errorlevel% neq 0 (
        echo   ❌ pyodbc 安装失败，请手动执行: pip install pyodbc
        pause
        exit /b 1
    )
)
echo   ✅ pyodbc 已就绪

:: 检查 Node.js 依赖
if not exist "node_modules\express" (
    echo   📦 正在安装 Node.js 依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo   ❌ 依赖安装失败
        pause
        exit /b 1
    )
)
echo   ✅ Node.js 依赖已就绪

:: 检查端口是否被占用
netstat -ano | findstr ":3456" >nul 2>nul
if %errorlevel% equ 0 (
    echo   ⚠️  端口 3456 已被占用，尝试关闭旧进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3456"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    timeout /t 2 /nobreak >nul
)

:: 启动服务器
echo   🚀 正在启动服务器...
start "" http://localhost:3456
node server.js

pause
