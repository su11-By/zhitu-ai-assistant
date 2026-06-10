from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'


@app.route('/health')
def health():
    """健康检查"""
    return jsonify({'status': 'ok'})


@app.route('/ai/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def ai_proxy(path):
    """AI API 代理"""
    # 处理 OPTIONS 预检请求
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

    # 构建目标 URL
    target_url = f'{DEEPSEEK_BASE_URL}/{path}'

    # 构建请求头
    headers = {
        'Content-Type': request.content_type or 'application/json'
    }

    # 传递 Authorization 头
    auth_header = request.headers.get('Authorization')
    if auth_header:
        headers['Authorization'] = auth_header

    try:
        # 转发请求
        if request.method == 'GET':
            response = requests.get(target_url, headers=headers, timeout=30)
        else:
            response = requests.post(
                target_url,
                headers=headers,
                json=request.get_json(),
                timeout=30
            )

        # 构建响应
        flask_response = Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/json')
        )
        flask_response.headers['Access-Control-Allow-Origin'] = '*'
        return flask_response

    except requests.Timeout:
        return jsonify({'error': '请求超时'}), 504
    except requests.RequestException as e:
        return jsonify({'error': f'代理错误: {str(e)}'}), 502


if __name__ == '__main__':
    app.run(debug=True, port=5000)