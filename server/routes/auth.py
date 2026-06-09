from flask import Blueprint, request, jsonify
from lib.database import get, insert
from lib.auth import hash_password, verify_password, create_salt, generate_token, authenticate
from lib.utils import clean_string, handle_server_error
from lib.limiter import limiter

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/auth/register', methods=['POST'])
@limiter.limit('10/15minute')
def register():
    data = request.get_json() or {}
    username = clean_string(data.get('username', ''), 30)
    password = data.get('password', '') if isinstance(data.get('password'), str) else ''
    email = clean_string(data.get('email', '') or '', 120)

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400
    if len(username) < 2 or len(username) > 30:
        return jsonify({'error': 'Username must be 2-30 characters'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    import re
    if not re.search(r'[a-zA-Z]', password) or not re.search(r'[0-9]', password):
        return jsonify({'error': 'Password must contain letters and numbers'}), 400

    try:
        existing = get('users', {'username': username})
        if not existing and email:
            existing = get('users', {'email': email})
        if existing:
            return jsonify({'error': 'User already exists'}), 409

        salt = create_salt()
        password_hash = hash_password(password, salt)
        from lib.utils import generate_id
        user_id = generate_id('user')

        insert_data = {
            'id': user_id,
            'username': username,
            'passwordHash': password_hash,
            'salt': salt,
            'role': 'user'
        }
        if email:
            insert_data['email'] = email
        user = insert('users', insert_data)

        token = generate_token(user_id)
        return jsonify({
            'token': token,
            'user': {'id': user['id'], 'username': user['username'], 'email': user['email']}
        })
    except Exception as e:
        return handle_server_error(e)


@auth_bp.route('/api/auth/login', methods=['POST'])
@limiter.limit('10/minute')
def login():
    data = request.get_json() or {}
    username = clean_string(data.get('username', ''), 30)
    password = data.get('password', '') if isinstance(data.get('password'), str) else ''

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    try:
        user = get('users', {'username': username})
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        if not verify_password(password, user['passwordHash'], user['salt']):
            return jsonify({'error': 'Invalid credentials'}), 401

        token = generate_token(user['id'])
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role']
            }
        })
    except Exception as e:
        return handle_server_error(e)


@auth_bp.route('/api/auth/me', methods=['GET'])
@authenticate
def me():
    try:
        from flask import g
        user = get('users', {'id': g.user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'role': user['role']
        })
    except Exception as e:
        return handle_server_error(e)
