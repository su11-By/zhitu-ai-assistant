# AI 智能助手后端服务

基于 Flask + SQLite 的 AI 智能助手后端服务，提供用户认证、知识库管理、聊天会话、任务管理等功能。

---

## 📋 项目概述

本项目是一个 AI 智能助手应用的后端服务，采用 Python Flask 框架，提供完整的 RESTful API 接口。

### ✨ 功能特性

| 模块 | 功能 | 状态 |
|------|------|------|
| **用户管理** | 注册、登录、JWT认证 | ✅ 已完成 |
| **知识库管理** | 创建、编辑、删除知识库 | ✅ 已完成 |
| **文档管理** | 文档上传、解析、分块存储 | ✅ 已完成 |
| **聊天系统** | 会话管理、消息记录 | ✅ 已完成 |
| **任务管理** | 任务创建、状态更新 | ✅ 已完成 |
| **网页搜索** | 集成搜狗搜索 | ✅ 已完成 |

---

## 🛠️ 技术栈

### 后端技术

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.10+ | 运行时环境 |
| Flask | 3.x | Web 框架 |
| SQLite3 | - | 数据库（Python 内置） |
| PyJWT | 2.x | JWT 令牌 |
| BeautifulSoup4 | 4.x | HTML 解析 |
| Flask-Limiter | 3.x | 请求限流 |
| Flask-Talisman | 1.x | 安全头 |
| Flask-Compress | 1.x | Gzip 压缩 |

### 数据库设计

#### 数据库表结构

**users（用户表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 用户ID（主键） |
| username | TEXT | 用户名（唯一） |
| email | TEXT | 邮箱（可选） |
| passwordHash | TEXT | 密码哈希 |
| salt | TEXT | 盐值 |
| role | TEXT | 用户角色 |
| createdAt | TEXT | 创建时间 |
| updatedAt | TEXT | 更新时间 |

**knowledge_bases（知识库表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 知识库ID（主键） |
| name | TEXT | 知识库名称 |
| description | TEXT | 描述 |
| category | TEXT | 分类 |
| userId | TEXT | 所属用户ID |
| createdAt | TEXT | 创建时间 |
| updatedAt | TEXT | 更新时间 |

**documents（文档表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 文档ID（主键） |
| title | TEXT | 文档标题 |
| content | TEXT | 文档内容 |
| fileType | TEXT | 文件类型 |
| kbId | TEXT | 所属知识库ID |
| createdAt | TEXT | 创建时间 |
| updatedAt | TEXT | 更新时间 |

**chat_sessions（聊天会话表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 会话ID（主键） |
| title | TEXT | 会话标题 |
| userId | TEXT | 所属用户ID |
| kbId | TEXT | 关联知识库ID |
| skillId | TEXT | 关联技能ID |
| createdAt | TEXT | 创建时间 |
| updatedAt | TEXT | 更新时间 |

**chat_messages（聊天消息表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 消息ID（主键） |
| sessionId | TEXT | 所属会话ID |
| role | TEXT | 角色（user/assistant） |
| content | TEXT | 消息内容 |
| timestamp | TEXT | 时间戳 |

**tasks（任务表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 任务ID（主键） |
| title | TEXT | 任务标题 |
| description | TEXT | 任务描述 |
| status | TEXT | 状态（pending/completed） |
| priority | TEXT | 优先级（high/medium/low） |
| userId | TEXT | 所属用户ID |
| createdAt | TEXT | 创建时间 |
| updatedAt | TEXT | 更新时间 |

---

## 🌐 API 接口文档

### 认证接口

#### 注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string (可选)"
}
```

**响应：**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

#### 登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### 获取当前用户

```http
GET /api/auth/me
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "string"
}
```

---

### 知识库接口

#### 获取知识库列表

```http
GET /api/kbs
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "userId": "string",
    "documentCount": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### 创建知识库

```http
POST /api/kbs
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "string",
  "description": "string (可选)",
  "category": "string (可选)"
}
```

**响应：**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 获取知识库详情

```http
GET /api/kbs/:id
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "userId": "string",
  "documents": [],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 更新知识库

```http
PUT /api/kbs/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "category": "string"
}
```

**响应：**
```json
{
  "success": true
}
```

#### 删除知识库

```http
DELETE /api/kbs/:id
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "success": true
}
```

---

### 文档接口

#### 获取文档列表

```http
GET /api/kbs/:kbId/docs
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
[
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "fileType": "string",
    "kbId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### 创建文档

```http
POST /api/kbs/:kbId/docs
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "fileType": "string (可选)"
}
```

**响应：**
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "fileType": "string",
  "kbId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 获取文档详情

```http
GET /api/docs/:id
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "fileType": "string",
  "kbId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 删除文档

```http
DELETE /api/docs/:id
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "success": true
}
```

---

### 聊天接口

#### 获取会话列表

```http
GET /api/chat/sessions
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
[
  {
    "id": "string",
    "title": "string",
    "userId": "string",
    "kbId": "string",
    "skillId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### 创建会话

```http
POST /api/chat/sessions
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "string (可选)",
  "kbId": "string (可选)",
  "skillId": "string (可选)"
}
```

**响应：**
```json
{
  "id": "string",
  "title": "string",
  "userId": "string",
  "kbId": "string",
  "skillId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 获取会话消息

```http
GET /api/chat/sessions/:id/messages
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
[
  {
    "id": "string",
    "sessionId": "string",
    "role": "string",
    "content": "string",
    "timestamp": "string"
  }
]
```

#### 发送消息

```http
POST /api/chat/sessions/:id/messages
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "role": "string",
  "content": "string"
}
```

**响应：**
```json
{
  "id": "string",
  "sessionId": "string",
  "role": "string",
  "content": "string",
  "timestamp": "string"
}
```

#### 删除会话

```http
DELETE /api/chat/sessions/:id
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "success": true
}
```

---

### 任务接口

#### 获取任务列表

```http
GET /api/tasks
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### 创建任务

```http
POST /api/tasks
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "string",
  "description": "string (可选)",
  "status": "string (可选)",
  "priority": "string (可选)"
}
```

**响应：**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 更新任务

```http
PUT /api/tasks/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string"
}
```

**响应：**
```json
{
  "success": true
}
```

#### 删除任务

```http
DELETE /api/tasks/:id
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "success": true
}
```

---

### 搜索接口

#### 网页搜索

```http
GET /api/search/web?query=关键词
```

**响应：**
```json
{
  "results": [
    {
      "title": "string",
      "snippet": "string",
      "url": "string"
    }
  ]
}
```

#### 网页内容抓取

```http
GET /api/fetch/BASE64_ENCODED_URL
```

**响应：**
```json
{
  "title": "string",
  "text": "string",
  "url": "string"
}
```

---

## 🚀 安装部署

### 环境要求

- Python >= 3.10
- pip >= 21.x

### 安装步骤

```bash
# 进入项目目录
cd server

# 创建虚拟环境（推荐）
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 JWT_SECRET

# 启动服务器
python app.py
```

### 配置说明

服务器默认配置：
- 端口：3001
- 数据库：`./data/app.db`
- 最大请求体大小：2MB
- 请求限流：搜索 30次/分钟，抓取 60次/分钟

---

## 📁 项目结构

```
server/
├── lib/
│   ├── __init__.py
│   ├── auth.py          # 认证相关（JWT、密码哈希）
│   ├── database.py      # 数据库操作封装
│   ├── limiter.py       # 限流器配置
│   └── utils.py         # 工具函数
├── routes/
│   ├── __init__.py
│   ├── auth.py          # 认证路由
│   ├── chat.py          # 聊天路由
│   ├── chunks.py        # 分块路由
│   ├── documents.py     # 文档路由
│   ├── knowledge_base.py # 知识库路由
│   ├── search.py        # 搜索路由
│   └── tasks.py         # 任务路由
├── data/
│   └── app.db           # SQLite 数据库文件（运行时自动创建）
├── app.py               # 服务器入口文件
├── check_db.py          # 数据库检查脚本
├── requirements.txt     # Python 依赖
├── .env                 # 环境变量
├── .env.example         # 环境变量模板
└── README.md            # 项目说明文档
```

---

## 🔒 安全特性

- ✅ JWT Token 认证
- ✅ PBKDF2-SHA256 密码哈希存储
- ✅ 请求限流保护
- ✅ Flask-Talisman 安全头
- ✅ CORS 跨域配置
- ✅ SSRF 防护
- ✅ 输入验证与 SQL 注入防护

---

## 📝 License

MIT License

---

## 📧 联系方式

如有问题，请联系项目维护者。
