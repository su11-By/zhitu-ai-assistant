import uuid
import os
from flask import jsonify


def generate_id(prefix='id'):
    """生成带前缀的 UUID"""
    return f'{prefix}-{uuid.uuid4()}'


def clean_string(value, max_length=5000):
    """清理字符串：去首尾空格，截断到最大长度"""
    if not isinstance(value, str):
        return ''
    return value.strip()[:max_length]


def handle_server_error(e):
    """统一错误响应 - 默认不泄露内部错误详情"""
    print(f'[Route Error] {e}')
    is_dev = os.environ.get('NODE_ENV') == 'development'
    message = str(e) if is_dev else '服务器内部错误'
    return jsonify({'error': message}), 500
