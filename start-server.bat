@echo off
echo ========================================
echo   Art Design Pro - 库存销售管理系统
echo ========================================
echo.

echo [1/3] 安装后端依赖...
cd server
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败！
    pause
    exit /b 1
)

echo.
echo [2/3] 初始化数据库...
call npm run init-db
if %errorlevel% neq 0 (
    echo 数据库初始化失败！
    pause
    exit /b 1
)

echo.
echo [3/3] 启动后端服务...
echo.
echo 后端服务启动在: http://localhost:3000
echo.
echo 请在另一个终端窗口运行 "npm run dev" 启动前端
echo.
call npm start
