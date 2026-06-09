# PythonAnywhere 部署指南

## 前提条件

1. 注册 PythonAnywhere 账号（免费版即可）
2. 项目已构建前端（`dist/` 目录已生成）

## 部署步骤

### 1. 上传项目文件

将整个 `server/` 目录上传到 PythonAnywhere：

```
/home/username/mysite/
├── app.py
├── wsgi.py
├── requirements.txt
├── .env
├── lib/
├── routes/
├── data/
└── dist/
```

**方法一：使用 Git**
```bash
cd /home/username/mysite
git clone <your-repo-url> server
```

**方法二：使用文件上传**
- 在 PythonAnywhere 的 Files 页面上传压缩包
- 解压到 `/home/username/mysite/server/`

### 2. 安装依赖

打开 PythonAnywhere 的 **Bash console**：

```bash
cd /home/username/mysite/server
pip install -r requirements.txt
```

### 3. 配置环境变量

在 `/home/username/mysite/server/` 目录创建 `.env` 文件：

```env
JWT_SECRET=your-secure-random-secret-here
PORT=3001
NODE_ENV=production
```

**生成安全的 JWT_SECRET：**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. 配置 Web 应用

1. 进入 PythonAnywhere 的 **Web** 页面
2. 点击 **Add a new web app**
3. 选择 **Manual configuration**
4. 选择 **Python 3.10**

### 5. 配置 WSGI

在 Web 页面的 **Code** 部分，点击 **WSGI configuration file**，将内容替换为：

```python
import sys
import os
from pathlib import Path

# 项目路径
project_home = '/home/username/mysite/server'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# 加载环境变量
from dotenv import load_dotenv
load_dotenv(Path(project_home) / '.env')

# 导入 Flask app
from app import app as application

# 初始化数据库
from lib.database import connect_db
connect_db()
```

**注意：** 将 `username` 替换为你的 PythonAnywhere 用户名。

### 6. 设置虚拟环境（可选但推荐）

在 Web 页面的 **Virtualenv** 部分：

```bash
mkvirtualenv myenv --python=python3.10
pip install -r /home/username/mysite/server/requirements.txt
```

然后在 Web 页面设置虚拟环境路径：
```
/home/username/.virtualenvs/myenv
```

### 7. 重启应用

点击 Web 页面顶部的 **Reload** 按钮。

### 8. 访问应用

访问：`https://username.pythonanywhere.com`

## 常见问题

### 1. 数据库路径问题

如果数据库文件路径错误，检查 `lib/database.py` 中的路径配置。

### 2. 静态文件 404

确保 `dist/` 目录已正确上传到 `server/` 目录下。

### 3. CORS 错误

在 `app.py` 中添加你的 PythonAnywhere 域名到 CORS origins 列表。

### 4. 环境变量未加载

确保 `.env` 文件在 `server/` 目录下，且格式正确。

## 免费版限制

- 每月 CPU 时间有限
- 没有自定义域名
- 必须每 3 个月访问一次保持活跃
- 无法访问外部网络（需要付费版）

## 付费版优势

- 自定义域名
- 更多 CPU 时间
- 可以访问外部网络（调用 LM Studio 等）
- 更好的性能
