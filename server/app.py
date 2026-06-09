import os
import sys
import time
import signal
from pathlib import Path

# 加载 .env 文件（必须在其他 import 之前）
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

# 确保 JWT_SECRET 存在
if not os.environ.get('JWT_SECRET'):
    print('[Server] FATAL: JWT_SECRET environment variable is required. Set it in .env file.')
    sys.exit(1)

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_compress import Compress
from flask_talisman import Talisman

from lib.database import connect_db
from lib.limiter import limiter
from routes.auth import auth_bp
from routes.knowledge_base import kb_bp
from routes.documents import docs_bp
from routes.chunks import chunks_bp
from routes.chat import chat_bp
from routes.tasks import tasks_bp
from routes.search import search_bp

PORT = int(os.environ.get('PORT', 3001))

# 静态文件目录（Vue 构建产物）
DIST_DIR = Path(__file__).parent / 'dist'

app = Flask(__name__, static_folder=None)

# ── 中间件 ──

# CORS - 限制允许的来源
CORS(app, origins=[
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://*.onrender.com',
    'https://*.ngrok.io',
    'https://*.ngrok-free.app'
], supports_credentials=True)

# 安全头（Talisman）
Talisman(
    app,
    force_https=False,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: blob:",
        'connect-src': "'self' http://localhost:1234 http://127.0.0.1:1234 https://*.ngrok.io https://*.ngrok-free.app",
        'font-src': "'self'",
        'object-src': "'none'"
    }
)

# Gzip 压缩
Compress(app)

# 请求日志
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('flask')

@app.before_request
def log_request():
    logger.info(f'{__import__("flask").request.method} {__import__("flask").request.path}')

# JSON 请求体大小限制（Flask 默认无限制，通过 werkzeug 配置）
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB

# ── 限流 ──
limiter.init_app(app)

# ── 注册蓝图 ──
app.register_blueprint(auth_bp)
app.register_blueprint(kb_bp)
app.register_blueprint(docs_bp)
app.register_blueprint(chunks_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(search_bp)

# 对搜索和抓取端点应用限流
# 通过装饰器在蓝图中已经定义，这里用 limiter 来限制
# 注意：Flask-Limiter 的 limiter.limit() 装饰器需要在蓝图注册前应用
# 这里我们用另一种方式：在蓝图中使用 @limiter.limit()


# ── 健康检查 ──
@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'timestamp': int(time.time() * 1000),
        'uptime': time.process_time()
    })


# ── 静态文件服务 ──
@app.route('/')
def serve_index():
    return send_from_directory(str(DIST_DIR), 'index.html')


# 静态文件路由
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(str(DIST_DIR / 'assets'), filename)


# 其他静态文件
@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory(str(DIST_DIR), 'favicon.ico')


@app.route('/vite.svg')
def serve_vite_svg():
    return send_from_directory(str(DIST_DIR), 'vite.svg')


# ── 错误处理 ──
@app.errorhandler(404)
def not_found(e):
    from flask import request
    # 如果是 API 路由，返回 JSON 错误
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Not found'}), 404
    # 否则返回 index.html（支持 Vue Router）
    try:
        return send_from_directory(str(DIST_DIR), 'index.html')
    except Exception:
        return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(e):
    print(f'[Server Error] {e}')
    is_dev = os.environ.get('NODE_ENV') == 'development'
    message = str(e) if is_dev else '服务器内部错误'
    return jsonify({'error': message}), 500


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': '请求过于频繁，请稍后重试'}), 429


# ── 启动服务器 ──
def start_server():
    connect_db()
    print(f'[Server] http://127.0.0.1:{PORT}  |  env: {os.environ.get("NODE_ENV", "development")}')
    print(f'[Server] Network access: http://0.0.0.0:{PORT}')

    # 优雅关闭
    def shutdown_handler(signum, frame):
        print(f'\n[Server] Received signal {signum}, shutting down gracefully...')
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    app.run(host='0.0.0.0', port=PORT, debug=False)


if __name__ == '__main__':
    start_server()
