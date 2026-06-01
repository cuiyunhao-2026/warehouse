@echo off
chcp 65001 >nul
echo ========================================
echo   Art Design Pro - 库存销售管理系统
echo   一键启动脚本
echo ========================================
echo.

:: 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo [1/4] 安装后端依赖...
cd server
call npm install --silent
if %errorlevel% neq 0 (
    echo [错误] 后端依赖安装失败
    pause
    exit /b 1
)
echo [✓] 后端依赖安装完成

echo.
echo [2/4] 删除旧数据库（确保表结构最新）...
if exist inventory.db del /f inventory.db
echo [✓] 旧数据库已删除

echo.
echo [3/4] 安装前端依赖...
cd ..
call npm install --silent
if %errorlevel% neq 0 (
    echo [错误] 前端依赖安装失败
    pause
    exit /b 1
)
echo [✓] 前端依赖安装完成

echo.
echo [4/4] 启动服务...
echo.
echo ========================================
echo   后端服务: http://localhost:3000
echo   前端服务: http://localhost:5173
echo ========================================
echo.
echo   默认账号: admin / 123456
echo.
echo ========================================
echo.

:: 启动后端（新窗口）
start "后端服务 - localhost:3000" cmd /k "cd server && npm start"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端
call npm run dev
