# 智途 AI 助手 — 基于 DeepSeek API 的智能学习助手

## 📋 项目简介

智途 AI 助手是一个面向课程学习和答辩准备场景的 AI 辅助系统，集成了知识库管理、智能问答、深度研究、任务管理和工作台组织等功能。

### 核心功能

| 模块 | 功能说明 |
|------|----------|
| 📊 项目总览 | 展示知识条目、任务数量、工作台卡片和问答记录 |
| 🗂️ 工作台 | 卡片式信息组织，支持文本/代码/图表/脑图/表格/文档 |
| 📚 知识库 | 个人库/团队库、多格式导入、自动分类标签、检索溯源 |
| 💬 智能问答 | 双源问答（知识库+全网）、深度研究、多模态理解 |
| ✅ 任务管理 | 增删改查、优先级、截止日期、状态统计 |
| ⚙️ 设置 | 主题切换、数据导出、演示数据恢复 |

## 🤖 AI 技术方案

### 1. AI 模型选择
- **主模型**: DeepSeek V4 Flash（deepseek-v4-flash）
- **API 兼容**: OpenAI 兼容格式
- **调用方式**: 直接调用 DeepSeek API

### 2. RAG 检索增强生成
```mermaid
flowchart LR
    A[文档导入] --> B[文本分块]
    B --> C[向量嵌入]
    C --> D[向量存储]
    D --> E[语义检索]
    E --> F[上下文增强]
    F --> G[AI 生成回答]
```

### 3. 技术架构
- **前端**: Vue 3 + Vite 5 + Pinia + Vue Router
- **AI 服务**: DeepSeek API（直接调用）
- **向量存储**: IndexedDB（浏览器端）
- **数据持久化**: localStorage
- **部署**: GitHub Pages（前端）+ PythonAnywhere（后端）

## 🚀 环境配置步骤

### 环境要求
- **Node.js** >= 18
- **DeepSeek API Key** — [获取地址](https://platform.deepseek.com/)

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/su11-By/zhitu-ai-assistant.git
cd zhitu-ai-assistant

# 2. 安装前端依赖
npm install

# 3. 配置 API Key
# 在设置页面输入 DeepSeek API Key
```

### 启动方式

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

启动后访问 **http://localhost:5173**

## 🌐 部署链接

- **前端**: https://su11-by.github.io/zhitu-ai-assistant/
- **后端**: https://admin051104.pythonanywhere.com

## 📸 演示截图

### 1. 项目总览页面
![项目总览](./screenshots/overview.png)

### 2. 智能问答界面
![智能问答](./screenshots/chat.png)

### 3. 知识库管理
![知识库](./screenshots/knowledge.png)

### 4. 任务管理
![任务管理](./screenshots/tasks.png)

## 📁 项目结构

```text
├── index.html              # 入口 HTML
├── vite.config.js          # Vite 配置
├── package.json            # 前端依赖与脚本
├── requirements.txt        # Python 依赖
├── README.md               # 项目说明文档
├── server/                 # Python 后端
│   ├── app.py              # Flask 主应用
│   └── proxy_server.py     # API 代理服务
├── src/                    # Vue 3 前端源码
│   ├── App.vue             # 根组件
│   ├── main.js             # 应用入口
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── services/           # 业务服务层
│   ├── components/         # 组件
│   └── utils/              # 工具函数
├── .github/workflows/      # GitHub Actions 部署配置
└── dist/                   # 构建产物
```

## 🎯 项目亮点

1. **完整 RAG 链路**: 文档解析 → 分块 → 嵌入 → 向量存储 → 语义检索 → 增强回答
2. **11 种 AI 技能**: 覆盖设计/规划/创作等领域
3. **双源问答**: 知识库资料 + 联网搜索联合回答
4. **流式对话**: 实时输出 + Token 级上下文管理
5. **主题系统**: 浅色/深色一键切换
6. **自动部署**: GitHub Actions 自动构建部署

## 📦 依赖说明

### 前端依赖 (package.json)
- Vue 3, Vite 5, Pinia, Vue Router
- marked, dompurify (Markdown 渲染)
- pdfjs-dist, mammoth (文档解析)

### Python 依赖 (requirements.txt)
- Flask, Flask-CORS
- requests

## 📝 项目总结

本项目完成了一个具备清晰定位、完整界面结构和核心交互逻辑的 AI 学习助手系统。它不仅能展示前端工程实现能力，也能体现知识管理、智能问答和产品交互设计思路，适合作为课程期末项目进行答辩展示。
