"""
PythonAnywhere WSGI 配置文件

部署步骤：
1. 将项目上传到 /home/username/mysite/
2. 在 PythonAnywhere 的 Web 页面中，设置 WSGI 配置文件指向此文件
3. 设置环境变量（在 Files 页面创建 .env 文件）
4. 安装依赖：pip install -r requirements.txt
"""

import sys
import os
from pathlib import Path

# 添加项目路径
project_home = Path(__file__).parent
if str(project_home) not in sys.path:
    sys.path.insert(0, str(project_home))

# 加载环境变量
from dotenv import load_dotenv
load_dotenv(project_home / '.env')

# 导入 Flask app
from app import app as application

# 初始化数据库
from lib.database import connect_db
connect_db()
