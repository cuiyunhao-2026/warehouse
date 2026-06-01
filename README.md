<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Element_Plus-2.11-409EFF?style=flat-square&logo=element" alt="Element Plus">
  <img src="https://img.shields.io/badge/Pinia-3.0-FAD02C?style=flat-square" alt="Pinia">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

<h1 align="center">Art Design Pro - 库存销售管理系统</h1>

<p align="center">
  一个基于 Vue 3 + Element Plus + TypeScript 的现代化库存销售管理系统
</p>

<p align="center">
  <a href="./README.zh-CN.md">中文</a> | <span>English</span>
</p>

<p align="center">
  <a href="#项目简介">项目简介</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#权限系统">权限系统</a> •
  <a href="#部署指南">部署指南</a> •
  <a href="#交流与合作">交流与合作</a>
</p>

---

## 📖 项目简介

**Art Design Pro 库存销售管理系统**是一个基于 [Art Design Pro](https://github.com/Daymychen/art-design-pro) 模板二次开发的企业级后台管理解决方案，专为中小型企业的库存和销售管理需求设计。

> ⚠️ **声明**：本项目是基于 [Daymychen/art-design-pro](https://github.com/Daymychen/art-design-pro) 模板进行的二次开发，原模板提供了优秀的后台管理框架和UI设计，本项目在此基础上增加了完整的库存管理、销售管理、采购管理等业务功能。

### 🎯 项目定位

| 项目属性     | 说明                                                       |
| ------------ | ---------------------------------------------------------- |
| **项目类型** | 企业级后台管理系统（库存销售方向）                         |
| **项目版本** | v1.0.0                                                     |
| **发布日期** | 2026年5月11日                                              |
| **开发模式** | 纯前端架构（Mock数据 + localStorage持久化）                |
| **适用场景** | 中小型企业库存管理、批发零售行业销售管理、前端项目学习参考 |

### 🔗 相关链接

| 链接             | 地址                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| **作者GitHub**   | [cuiyunhao-2026](https://github.com/cuiyunhao-2026)                     |
| **作者邮箱**     | 1830099122@qq.com                                                       |
| **上游模板仓库** | [Daymychen/art-design-pro](https://github.com/Daymychen/art-design-pro) |

---

## 🛠️ 技术栈

### 核心框架

| 技术           | 版本    | 说明                                         |
| -------------- | ------- | -------------------------------------------- |
| **Vue 3**      | ^3.5.21 | 渐进式 JavaScript 框架，采用 Composition API |
| **TypeScript** | ~5.6.3  | JavaScript 超集，提供静态类型检查            |
| **Vite**       | ^7.1.5  | 下一代前端构建工具，极速热更新               |

### UI 与样式

| 技术             | 版本    | 说明                   |
| ---------------- | ------- | ---------------------- |
| **Element Plus** | ^2.11.2 | Vue 3 企业级 UI 组件库 |
| **TailwindCSS**  | ^4.1.14 | 实用优先的 CSS 框架    |
| **Sass**         | ^1.81.0 | CSS 预处理器           |
| **@iconify/vue** | ^5.0.0  | 统一图标库解决方案     |

### 状态管理与路由

| 技术           | 版本   | 说明                  |
| -------------- | ------ | --------------------- |
| **Pinia**      | ^3.0.3 | Vue 3 官方状态管理库  |
| **Vue Router** | ^4.5.1 | Vue.js 官方路由管理器 |

### 数据处理与工具

| 技术             | 版本    | 说明                 |
| ---------------- | ------- | -------------------- |
| **ECharts**      | ^6.0.0  | 百度开源数据可视化库 |
| **xlsx**         | ^0.18.5 | Excel 文件读写库     |
| **file-saver**   | ^2.0.5  | 客户端文件保存库     |
| **Axios**        | ^1.12.2 | HTTP 请求库          |
| **vue-i18n**     | ^9.14.0 | Vue 国际化插件       |
| **@vueuse/core** | ^13.9.0 | Vue 组合式函数工具集 |
| **crypto-js**    | ^4.2.0  | 加密算法库           |

### 开发工具

| 技术           | 版本    | 说明                               |
| -------------- | ------- | ---------------------------------- |
| **ESLint**     | ^9.0.0  | JavaScript/TypeScript 代码检查工具 |
| **Prettier**   | ^3.0.0  | 代码格式化工具                     |
| **Husky**      | ^9.0.0  | Git hooks 管理工具                 |
| **commitlint** | ^19.0.0 | Git 提交信息规范检查               |

---

## ✨ 功能特性

### 📊 仪表盘

- 数据概览卡片（商品总数、库存总量、库存总值、低库存预警）
- 库存趋势图表（最近7天出入库趋势）
- 低库存预警列表
- 分类库存分布饼图
- 库存价值分布图表

### 📦 商品管理

- 商品 CRUD 操作（新增、编辑、删除、查看详情）
- 商品分类管理（树形结构、多级分类）
- 单位管理（计量单位维护）
- 仓库关联（每个商品关联一个仓库）
- 多条件搜索（名称、编码、分类、仓库、状态）

### 📥 库存管理

- **入库管理** - 商品入库操作、入库记录查询、记录删除
- **出库管理** - 商品出库操作、出库记录查询、记录删除、库存校验
- **库存盘点** - 实际库存与系统库存对比、差异计算、记录删除
- **库存查询** - 多条件搜索、库存状态展示、仓库筛选

### 🛒 采购管理

- 采购订单创建（选择供应商、添加商品明细）
- 订单审批流程（待处理 → 已审批 → 已完成）
- 订单管理（查看、删除、导出Excel、打印）
- 采购发票导出（Excel格式，符合国家规范）

### 💰 销售管理

- 销售订单创建（客户信息、商品明细）
- 订单状态管理（待处理 → 已完成）
- 订单管理（查看、删除、导出Excel、打印）
- 多类型发票导出：
  - 电子专用发票
  - 电子普通发票
  - 销售蓝字发票
  - 销售红字发票
  - 销货清单

### 🏢 供应商管理

- 供应商信息 CRUD
- 联系人信息管理
- 供应商状态管理（启用/禁用）

### 📈 报表统计

- 库存报表（库存概览、分类分布、价值分布）
- 出入库报表（出入库统计图表）
- 采购报表（采购金额、供应商统计）
- 销售报表（销售金额、热销商品统计）

### ⚙️ 系统管理

- **角色管理** - 角色 CRUD、权限配置
- **账号管理** - 用户账号管理、密码修改（仅超级管理员）
- **仓库管理** - 仓库信息维护
- **个人中心** - 个人信息修改、密码修改

### 🎨 系统特性

- **三级权限控制** - 路由级、菜单级、按钮级权限管理
- **国际化支持** - 中英文双语切换
- **主题切换** - 明暗主题、主题色自定义
- **响应式布局** - 适配桌面端和移动端
- **数据持久化** - localStorage 本地存储
- **Mock API** - 完整的前后端分离架构模拟

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 或 **pnpm**: >= 8.0.0
- **Git**: 最新版本

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/cuiyunhao-2026/art-design-pro-inventory.git

# 2. 进入项目目录
cd art-design-pro-inventory

# 3. 安装依赖
npm install
# 或使用 pnpm（推荐）
pnpm install

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器访问
# http://localhost:5173
```

### 默认账号

| 角色       | 用户名  | 密码     | 权限说明                         |
| ---------- | ------- | -------- | -------------------------------- |
| 超级管理员 | `admin` | `123456` | 所有权限（增删改查、导出、打印） |
| 普通管理员 | `user`  | `123456` | 部分权限（增、改、导出）         |

### 常用命令

```bash
# 开发模式（自动打开浏览器）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run serve

# 代码检查
npm run lint

# 代码格式化
npm run fix

# 提交代码（遵循 commitlint 规范）
npm run commit
```

---

## 📁 项目结构

```
art-design-pro-main/
├── public/                          # 静态资源目录
│   └── favicon.ico                  # 网站图标
├── src/
│   ├── api/                         # API 接口层
│   │   ├── auth.ts                  # 认证相关 API（登录、注册、用户信息）
│   │   ├── inventory.ts             # 库存管理核心 API（商品、分类、供应商、采购、销售、库存）
│   │   └── system-manage.ts         # 系统管理 API（用户、角色）
│   │
│   ├── assets/                      # 静态资源
│   │   ├── icons/                   # SVG 图标
│   │   ├── images/                  # 图片资源
│   │   └── styles/                  # 全局样式
│   │
│   ├── components/                  # 组件
│   │   ├── business/                # 业务组件
│   │   └── core/                    # 核心组件
│   │       ├── forms/               # 表单组件（含 ArtExcelExport 导出组件）
│   │       ├── layouts/             # 布局组件（Header、Sidebar、Main）
│   │       ├── tables/              # 表格组件
│   │       └── views/               # 视图组件（登录页、404等）
│   │
│   ├── config/                      # 配置文件
│   │   ├── index.ts                 # 主配置
│   │   └── modules/                 # 配置模块（顶栏、菜单等）
│   │
│   ├── directives/                  # 自定义指令
│   │   └── core/
│   │       ├── auth.ts              # v-auth 按钮权限指令
│   │       └── roles.ts             # v-roles 角色权限指令
│   │
│   ├── enums/                       # 枚举定义
│   ├── hooks/                       # 组合式函数
│   ├── locales/                     # 国际化资源
│   │   └── langs/
│   │       ├── zh.json              # 中文语言包
│   │       └── en.json              # 英文语言包
│   │
│   ├── mock/                        # Mock 数据
│   │   └── inventory/               # 库存管理 Mock 数据
│   │       ├── products.ts          # 商品数据（12个示例商品）
│   │       ├── categories.ts        # 分类数据（4个一级分类、11个二级分类）
│   │       ├── units.ts             # 单位数据（10个计量单位）
│   │       ├── suppliers.ts         # 供应商数据（6个供应商）
│   │       ├── purchases.ts         # 采购订单数据（5个订单）
│   │       ├── sales.ts             # 销售订单数据（6个订单）
│   │       ├── inventory-logs.ts    # 库存操作记录（16条记录）
│   │       └── warehouses.ts        # 仓库数据（4个仓库）
│   │
│   ├── router/                      # 路由配置
│   │   ├── guards/                  # 路由守卫（登录验证、权限检查）
│   │   ├── modules/                 # 路由模块定义
│   │   │   ├── dashboard.ts         # 仪表盘路由
│   │   │   ├── product.ts           # 商品管理路由
│   │   │   ├── inventory.ts         # 库存管理路由
│   │   │   ├── supplier.ts          # 供应商路由
│   │   │   ├── purchase.ts          # 采购管理路由
│   │   │   ├── sales.ts             # 销售管理路由
│   │   │   ├── report.ts            # 报表路由
│   │   │   └── system.ts            # 系统管理路由
│   │   ├── routes/                  # 路由定义（静态路由、动态路由）
│   │   └── core/                    # 路由核心模块（注册、权限验证）
│   │
│   ├── store/                       # Pinia 状态管理
│   │   └── modules/
│   │       ├── user.ts              # 用户状态（登录、Token、角色）
│   │       ├── menu.ts              # 菜单状态
│   │       ├── setting.ts           # 设置状态（主题、布局）
│   │       └── worktab.ts           # 工作台标签页状态
│   │
│   ├── types/                       # TypeScript 类型定义
│   │   ├── api/
│   │   │   ├── api.d.ts             # 通用 API 类型
│   │   │   └── inventory.d.ts       # 库存管理类型定义
│   │   └── router/                  # 路由类型定义
│   │
│   ├── utils/                       # 工具函数
│   │   ├── http/                    # HTTP 请求封装
│   │   ├── mock-storage.ts          # Mock 数据持久化工具
│   │   ├── storage/                 # 存储工具
│   │   └── ui/                      # UI 工具（动画、loading等）
│   │
│   └── views/                       # 页面视图
│       ├── auth/                    # 认证页面
│       │   ├── login/               # 登录页
│       │   ├── register/            # 注册页
│       │   └── forget-password/     # 忘记密码页
│       ├── dashboard/               # 仪表盘
│       │   ├── console/             # 控制台（数据概览）
│       │   ├── analysis/            # 分析页
│       │   └── ecommerce/           # 电商页
│       ├── product/                 # 商品管理
│       │   ├── list/                # 商品列表
│       │   ├── category/            # 分类管理
│       │   └── unit/                # 单位管理
│       ├── inventory/               # 库存管理
│       │   ├── inbound/             # 入库管理
│       │   ├── outbound/            # 出库管理
│       │   ├── check/               # 库存盘点
│       │   └── query/               # 库存查询
│       ├── supplier/                # 供应商管理
│       │   └── list/                # 供应商列表
│       ├── purchase/                # 采购管理
│       │   ├── list/                # 采购订单列表
│       │   └── create/              # 创建采购单
│       ├── sales/                   # 销售管理
│       │   ├── list/                # 销售订单列表
│       │   └── create/              # 创建销售单
│       ├── report/                  # 报表统计
│       │   ├── inventory/           # 库存报表
│       │   ├── inbound-outbound/    # 出入库报表
│       │   ├── purchase/            # 采购报表
│       │   └── sales/               # 销售报表
│       └── system/                  # 系统管理
│           ├── role/                # 角色管理
│           ├── warehouse/           # 仓库管理
│           ├── account/             # 账号管理
│           └── user-center/         # 个人中心
│
├── .env                             # 环境变量
├── .env.development                 # 开发环境变量
├── .env.production                  # 生产环境变量
├── vite.config.ts                   # Vite 构建配置
├── tsconfig.json                    # TypeScript 配置
├── tailwind.config.js               # TailwindCSS 配置
├── eslint.config.mjs                # ESLint 配置
├── .prettierrc                      # Prettier 配置
├── package.json                     # 项目依赖配置
├── CHANGELOG.md                     # 更新日志（英文）
├── CHANGELOG.zh-CN.md               # 更新日志（中文）
├── README.md                        # 项目说明文档（英文）
└── README.zh-CN.md                  # 项目说明文档（中文）
```

---

## 🔐 权限系统

系统采用三级权限控制机制，确保不同角色的用户只能访问和操作其权限范围内的功能。

### 第一级：路由级权限

通过路由配置中的 `meta.roles` 字段控制页面访问权限：

```typescript
// src/router/modules/system.ts
{
  path: 'account',
  name: 'AccountManage',
  component: '/system/account',
  meta: {
    title: '账号管理',
    roles: ['R_SUPER']  // 仅超级管理员可访问
  }
}
```

### 第二级：按钮级权限

通过 `v-auth` 指令控制按钮显示，权限标识在路由 `meta.authList` 中定义：

```vue
<ElButton v-auth="'add'">新增</ElButton>
<ElButton v-auth="'edit'">编辑</ElButton>
<ElButton v-auth="'delete'">删除</ElButton>
<ElButton v-auth="'export'">导出</ElButton>
<ElButton v-auth="'print'">打印</ElButton>
```

### 第三级：角色权限

通过 `v-roles` 指令控制元素显示：

```vue
<div v-roles="'R_SUPER'">仅超级管理员可见</div>
<div v-roles="['R_SUPER', 'R_ADMIN']">管理员可见</div>
```

### 角色权限对照表

| 角色代码  | 角色名称   | 路由权限 | 按钮权限         | 说明                             |
| --------- | ---------- | -------- | ---------------- | -------------------------------- |
| `R_SUPER` | 超级管理员 | 全部页面 | 增删改查导出打印 | 系统最高权限，可管理账号和角色   |
| `R_ADMIN` | 管理员     | 业务页面 | 增改导出         | 业务管理权限，不能管理账号和角色 |
| `R_USER`  | 普通用户   | 基础页面 | 查看             | 基础查看权限                     |

### 权限验证流程

```
用户登录 → 获取Token → 路由守卫拦截 → 获取用户信息（角色+按钮权限）
    ↓
根据角色筛选可访问的菜单 → 动态注册路由
    ↓
页面渲染时，v-auth 指令检查按钮权限 → 无权限的元素从DOM中移除
```

---

## 🌐 国际化

系统支持中英文双语，通过 `vue-i18n` 实现：

```typescript
// 切换语言
const { locale } = useI18n()
locale.value = 'zh' // 中文
locale.value = 'en' // 英文
```

语言包位置：`src/locales/langs/`

---

## 🎨 主题系统

系统支持明暗主题切换和主题色自定义：

- **亮色主题** - 默认主题，适合白天使用
- **暗色主题** - 护眼模式，适合夜间使用
- **主题色** - 支持自定义主题色，全局生效

---

## 📦 部署指南

### 开发环境

```bash
# 启动开发服务器（自动打开浏览器）
npm run dev

# 访问地址
http://localhost:5173
```

### 生产环境构建

```bash
# 构建生产版本
npm run build

# 构建产物在 dist 目录
# 预览生产版本
npm run serve
```

### 部署到 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 开启 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 部署到 Docker

```dockerfile
# 多阶段构建
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境变量配置

```bash
# .env.development
VITE_APP_TITLE=库存销售管理系统（开发）
VITE_APP_BASE_API=http://localhost:3000/api

# .env.production
VITE_APP_TITLE=库存销售管理系统
VITE_APP_BASE_API=https://your-api-server.com/api
```

---

## 🔧 开发指南

### 添加新功能模块

1. **创建路由** - `src/router/modules/` 下新建路由文件
2. **创建页面** - `src/views/` 下新建页面目录
3. **创建 API** - `src/api/` 下添加 API 函数
4. **创建 Mock** - `src/mock/` 下添加 Mock 数据
5. **添加类型** - `src/types/api/` 下添加类型定义
6. **配置菜单** - 路由配置中添加菜单信息和权限

### 添加新权限

1. 在路由 `meta.authList` 中添加权限标识
2. 在用户 `buttons` 数组中添加对应权限
3. 在页面中使用 `v-auth` 指令控制按钮显示

### Git 提交规范

项目使用 `commitlint` 规范 Git 提交信息：

```bash
# 提交格式
<type>(<scope>): <subject>

# 示例
feat(purchase): 添加采购订单导出功能
fix(inventory): 修复库存盘点记录删除问题
docs(readme): 更新项目文档
style(login): 调整登录页面样式
refactor(api): 重构API请求封装
test(unit): 添加单位管理单元测试
```

**提交类型说明**：

| 类型       | 说明                                              |
| ---------- | ------------------------------------------------- |
| `feat`     | 新功能                                            |
| `fix`      | 修复 Bug                                          |
| `docs`     | 文档更新                                          |
| `style`    | 代码格式（不影响代码运行的变动）                  |
| `refactor` | 重构（既不是新增功能，也不是修改 bug 的代码变动） |
| `perf`     | 性能优化                                          |
| `test`     | 增加测试                                          |
| `chore`    | 构建过程或辅助工具的变动                          |
| `revert`   | 回滚                                              |

---

## 📝 更新日志

详细的更新日志请查看：

- [CHANGELOG.md](./CHANGELOG.md) - 英文版
- [CHANGELOG.zh-CN.md](./CHANGELOG.zh-CN.md) - 中文版

---

## 🤝 交流与合作

### 💬 学习交流群

<p align="center">
  <img src="https://img.shields.io/badge/QQ群-1103024217-12B7F5?style=for-the-badge&logo=tencent-qq&logoColor=white" alt="QQ群">
</p>

**QQ群号：1103024217**

欢迎以下朋友加入交流：

- 🎓 **考研党** - 分享学习资料，交流备考经验
- 💻 **做项目的** - 项目开发讨论，技术方案交流
- 👨‍💻 **程序员** - 技术分享，问题解答，职业发展
- 🏆 **ACMer** - 算法竞赛交流，刷题打卡
- 🌟 **有志之士** - 任何对编程感兴趣的朋友

群内氛围友好，欢迎水群交流、技术讨论、资源共享！

### 🛠️ 代做服务

同时承接以下业务：

| 业务类型       | 说明                         |
| -------------- | ---------------------------- |
| **毕业设计**   | 计算机相关专业毕业设计代做   |
| **软件开发**   | 各类管理软件、工具软件开发   |
| **网站开发**   | 企业官网、个人博客、电商平台 |
| **小程序开发** | 微信小程序、支付宝小程序     |
| **APP开发**    | Android、iOS、跨平台应用     |
| **课程设计**   | 大学课程设计、实验报告       |
| **技术咨询**   | 技术方案设计、代码Review     |

如有需要，欢迎通过以下方式联系：

- **QQ群**：1103024217（群内私聊管理员）
- **邮箱**：1830099122@qq.com
- **GitHub**：[cuiyunhao-2026](https://github.com/cuiyunhao-2026)

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献步骤

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 Vue 3 Composition API 风格
- 使用 TypeScript 进行类型约束
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

## 🙏 致谢

- 感谢 [Daymychen/art-design-pro](https://github.com/Daymychen/art-design-pro) 提供的优秀模板
- 感谢 [Vue 3](https://vuejs.org/) 团队提供的优秀框架
- 感谢 [Element Plus](https://element-plus.org/) 团队提供的 UI 组件库
- 感谢所有开源贡献者的无私奉献

---

## 📞 联系方式

| 方式 | 链接 |
| --- | --- |
| **GitHub** | [cuiyunhao-2026](https://github.com/cuiyunhao-2026) |
| **邮箱** | 1830099122@qq.com |
| **QQ群** | 1103024217 |
| **Issues** | [提交 Issue](https://github.com/cuiyunhao-2026/art-design-pro-inventory/issues) |
| **Discussions** | [参与讨论](https://github.com/cuiyunhao-2026/art-design-pro-inventory/discussions) |

---

<p align="center">
  如果这个项目对你有帮助，请给一个 ⭐ Star 支持一下！
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/cuiyunhao-2026">cuiyunhao-2026</a>
</p>
