import hashlib
import hmac
import json
import base64
import os
import time
import functools
from flask import request, jsonify, g

# JWT 密钥 - 延迟获取，确保 app.py 已加载 .env
def _get_jwt_secret():
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        raise RuntimeError('JWT_SECRET environment variable is required')
    return secret

JWT_EXPIRES_IN = 7 * 24 * 60 * 60  # 7 天
PASSWORD_HASH_PREFIX = 'pbkdf2_sha256'
PASSWORD_ITERATIONS = 210_000
PASSWORD_KEYLEN = 32


def _base64url_encode(data: bytes) -> str:
    """Base64url 编码"""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')


def _base64url_decode(s: str) -> bytes:
    """Base64url 解码"""
    s = s.replace('-', '+').replace('_', '/')
    padding = 4 - len(s) % 4
    if padding != 4:
        s += '=' * padding
    return base64.urlsafe_b64decode(s)


def _legacy_hash_password(password: str, salt: str) -> str:
    """旧版 SHA-256 迭代哈希（兼容旧数据）"""
    h = password + salt
    for _ in range(10000):
        h = hashlib.sha256(h.encode('utf-8')).hexdigest()
    return h


def hash_password(password: str, salt: str) -> str:
    """
    使用 PBKDF2-SHA256 哈希密码。
    返回格式: pbkdf2_sha256$<iterations>$<salt>$<hash>
    """
    derived = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        PASSWORD_ITERATIONS,
        dklen=PASSWORD_KEYLEN
    )
    return f'{PASSWORD_HASH_PREFIX}${PASSWORD_ITERATIONS}${salt}${derived.hex()}'


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """
    验证密码。兼容新版 PBKDF2 和旧版 SHA-256 哈希。
    """
    if password_hash and password_hash.startswith(f'{PASSWORD_HASH_PREFIX}$'):
        parts = password_hash.split('$')
        if len(parts) != 4:
            return False
        _, iterations_text, stored_salt, stored_hash = parts
        try:
            iterations = int(iterations_text)
        except ValueError:
            return False
        if not stored_salt or not stored_hash:
            return False

        computed = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            stored_salt.encode('utf-8'),
            iterations,
            dklen=PASSWORD_KEYLEN
        )
        expected = bytes.fromhex(stored_hash)
        return hmac.compare_digest(computed, expected)

    # 旧版 SHA-256 兼容
    computed = _legacy_hash_password(password, salt)
    if len(computed) != len(password_hash):
        return False
    return hmac.compare_digest(computed.encode('utf-8'), password_hash.encode('utf-8'))


def create_salt() -> str:
    """生成 16 字节随机盐"""
    return os.urandom(16).hex()


def generate_token(user_id: str) -> str:
    """
    生成 JWT token（HMAC-SHA256 签名）。
    与 Node.js 版本格式兼容。
    """
    header = _base64url_encode(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode('utf-8'))
    payload_data = {
        'userId': user_id,
        'exp': int(time.time()) + JWT_EXPIRES_IN
    }
    payload = _base64url_encode(json.dumps(payload_data).encode('utf-8'))

    signature = _base64url_encode(
        hmac.new(
            _get_jwt_secret().encode('utf-8'),
            f'{header}.{payload}'.encode('utf-8'),
            hashlib.sha256
        ).digest()
    )
    return f'{header}.{payload}.{signature}'


def verify_token(token: str) -> dict | None:
    """
    验证 JWT token。
    返回解码后的 payload 或 None。
    """
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        payload = json.loads(_base64url_decode(parts[1]))

        # 检查过期
        if payload.get('exp') and payload['exp'] < time.time():
            return None

        # 验证签名
        expected_sig = _base64url_encode(
            hmac.new(
                _get_jwt_secret().encode('utf-8'),
                f'{parts[0]}.{parts[1]}'.encode('utf-8'),
                hashlib.sha256
            ).digest()
        )

        if not hmac.compare_digest(expected_sig, parts[2]):
            return None

        return payload
    except Exception:
        return None


def authenticate(f):
    """
    认证装饰器。验证 Bearer token 并将 user_id 存入 g.user_id。
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401

        token = auth_header.split(' ', 1)[1]
        decoded = verify_token(token)

        if not decoded:
            return jsonify({'error': 'Invalid token'}), 401

        g.user_id = decoded['userId']
        return f(*args, **kwargs)

    return decorated
