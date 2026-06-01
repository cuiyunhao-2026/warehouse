# 完整部署指南

## 本地开发

### Windows 用户

**一键启动：**

```bash
# 双击运行 start.bat
# 或在命令行执行
start.bat
```

**手动启动：**

```bash
# 1. 安装后端依赖并初始化数据库
cd server
npm install
npm run init-db
npm run dev

# 2. 新开一个终端，启动前端
cd ..
npm install
npm run dev
```

### Mac/Linux 用户

```bash
# 1. 安装后端依赖并初始化数据库
cd server
npm install
npm run init-db
npm run dev &

# 2. 安装前端依赖并启动
cd ..
npm install
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

---

## 部署到服务器

### 方式一：传统部署

#### 1. 服务器环境准备

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2
```

#### 2. 上传代码

使用 FTP 工具或 Git 将项目上传到服务器

```bash
# 使用 Git
git clone https://github.com/your-username/art-design-pro.git
cd art-design-pro
```

#### 3. 安装依赖并构建前端

```bash
# 安装前端依赖
npm install

# 构建前端
npm run build

# 安装后端依赖
cd server
npm install

# 初始化数据库
npm run init-db
```

#### 4. 启动后端服务

```bash
# 使用 PM2 启动
pm2 start app.js --name inventory-server

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
```

#### 5. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /path/to/art-design-pro/dist;  # 替换为实际路径
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 开启 gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# 重启 Nginx
sudo systemctl restart nginx
```

---

### 方式二：Docker 部署

#### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制前端代码
COPY package*.json ./
COPY . .

# 安装前端依赖并构建
RUN npm install
RUN npm run build

# 安装后端依赖
WORKDIR /app/server
RUN npm install
RUN npm run init-db

EXPOSE 3000

CMD ["node", "app.js"]
```

#### 2. 构建并运行

```bash
# 构建镜像
docker build -t inventory-system .

# 运行容器
docker run -d -p 3000:3000 --name inventory inventory-system

# 查看日志
docker logs inventory
```

#### 3. 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    volumes:
      - ./server/inventory.db:/app/server/inventory.db
    restart: always
```

```bash
docker-compose up -d
```

---

### 方式三：宝塔面板部署

#### 1. 安装宝塔面板

```bash
# Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

#### 2. 安装 Node.js 项目管理器

在宝塔面板 → 软件商店 → 安装 "Node.js项目管理器"

#### 3. 添加项目

1. 上传代码到服务器
2. 在 Node.js 项目管理器中添加项目
3. 启动命令：`cd server && node app.js`
4. 端口：3000

#### 4. 配置网站

1. 添加网站
2. 配置反向代理，将请求转发到 `http://127.0.0.1:3000`

---

## 数据备份

### 备份数据库

```bash
# 数据库文件位置
cp server/inventory.db backup/inventory_$(date +%Y%m%d).db
```

### 恢复数据库

```bash
# 停止服务
pm2 stop inventory-server

# 恢复数据库
cp backup/inventory_20260514.db server/inventory.db

# 启动服务
pm2 start inventory-server
```

### 定时备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backup"
DB_FILE="/path/to/server/inventory.db"
DATE=$(date +%Y%m%d_%H%M%S)

cp "$DB_FILE" "$BACKUP_DIR/inventory_$DATE.db"

# 保留最近30天的备份
find "$BACKUP_DIR" -name "inventory_*.db" -mtime +30 -delete
```

添加定时任务：

```bash
crontab -e
# 每天凌晨3点备份
0 3 * * * /path/to/backup.sh
```

---

## 常见问题

### Q: 数据库文件在哪里？

A: 数据库文件在 `server/inventory.db`，是一个 SQLite 文件。

### Q: 如何重置数据？

A: 删除 `server/inventory.db` 文件，然后重新运行 `npm run init-db`

### Q: 如何修改端口？

A: 修改 `server/.env` 文件中的 `PORT` 值

### Q: 如何添加新用户？

A: 通过注册页面注册，或直接在数据库中添加

### Q: 数据会丢失吗？

A: 数据保存在 SQLite 数据库文件中，只要不删除该文件，数据就不会丢失

---

## 性能优化

### 1. 启用 Gzip

在 Nginx 配置中启用 Gzip 压缩

### 2. 静态资源缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 数据库优化

定期清理过期的库存记录日志：

```sql
DELETE FROM inventory_logs WHERE created_at < datetime('now', '-90 days');
```

---

## 监控

### PM2 监控

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs inventory-server

# 监控面板
pm2 monit
```

### 健康检查

访问 `http://localhost:3000/api/health` 检查服务状态
