# 后端服务说明

## 环境要求

- Node.js >= 18.0.0
- npm 或 pnpm

## 安装步骤

```bash
# 进入后端目录
cd server

# 安装依赖
npm install
# 或
pnpm install

# 初始化数据库
npm run init-db

# 启动服务
npm run dev  # 开发模式（自动重启）
# 或
npm start    # 生产模式
```

## 启动前端

在另一个终端中：

```bash
# 回到项目根目录
cd ..

# 启动前端开发服务器
npm run dev
```

## 访问地址

- 前端：http://localhost:5173
- 后端API：http://localhost:3000/api

## 默认账号

| 用户名 | 密码   | 角色       |
| ------ | ------ | ---------- |
| admin  | 123456 | 超级管理员 |
| user   | 123456 | 管理员     |

## 数据库

使用 SQLite 数据库，数据文件保存在 `server/inventory.db`。

## API 接口

### 认证

- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/userInfo` - 获取用户信息
- `PUT /api/auth/profile` - 更新个人资料
- `PUT /api/auth/password` - 修改密码

### 商品

- `GET /api/products` - 获取商品列表
- `POST /api/products` - 添加商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

### 采购

- `GET /api/purchases` - 获取采购订单
- `POST /api/purchases` - 创建采购订单
- `PUT /api/purchases/:id/status` - 更新订单状态
- `DELETE /api/purchases/:id` - 删除订单

### 销售

- `GET /api/sales` - 获取销售订单
- `POST /api/sales` - 创建销售订单
- `PUT /api/sales/:id/status` - 更新订单状态
- `DELETE /api/sales/:id` - 删除订单

### 库存

- `POST /api/inventory/inbound` - 入库
- `POST /api/inventory/outbound` - 出库
- `POST /api/inventory/check` - 盘点
- `GET /api/inventory/logs` - 获取库存记录
- `DELETE /api/inventory/logs/:id` - 删除记录

## 部署到服务器

### 1. 上传代码

将整个项目上传到服务器

### 2. 安装依赖并初始化

```bash
cd server
npm install
npm run init-db
```

### 3. 使用 PM2 启动

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start app.js --name inventory-server

# 设置开机自启
pm2 startup
pm2 save
```

### 4. 配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
