from flask import Blueprint, request, jsonify, g
from lib.database import get, query, insert, update, remove, transaction
from lib.auth import authenticate
from lib.utils import generate_id, clean_string, handle_server_error

chat_bp = Blueprint('chat', __name__)


def _is_valid_role(role):
    return role in ('user', 'assistant')


@chat_bp.route('/api/chat/sessions', methods=['GET'])
@authenticate
def list_sessions():
    try:
        sessions = query('chat_sessions', {'userId': g.user_id})
        return jsonify(sessions)
    except Exception as e:
        return handle_server_error(e)


@chat_bp.route('/api/chat/sessions', methods=['POST'])
@authenticate
def create_session():
    data = request.get_json() or {}
    title = clean_string(data.get('title', '') or '新对话', 80) or '新对话'
    kb_id = clean_string(data.get('kbId', '') or '', 120) or None
    skill_id = clean_string(data.get('skillId', '') or '', 80) or None

    try:
        if kb_id:
            kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
            if not kb:
                return jsonify({'error': 'Access denied'}), 403

        session = insert('chat_sessions', {
            'id': generate_id('chat'),
            'title': title,
            'userId': g.user_id,
            'kbId': kb_id,
            'skillId': skill_id
        })
        return jsonify(session)
    except Exception as e:
        return handle_server_error(e)


@chat_bp.route('/api/chat/sessions/<session_id>/messages', methods=['GET'])
@authenticate
def list_messages(session_id):
    try:
        session = get('chat_sessions', {'id': session_id, 'userId': g.user_id})
        if not session:
            return jsonify({'error': 'Chat session not found'}), 404

        messages = query('chat_messages', {'sessionId': session_id})
        # 按时间戳排序
        messages.sort(key=lambda m: m.get('timestamp', ''))
        return jsonify(messages)
    except Exception as e:
        return handle_server_error(e)


@chat_bp.route('/api/chat/sessions/<session_id>/messages', methods=['POST'])
@authenticate
def create_message(session_id):
    data = request.get_json() or {}
    role = clean_string(data.get('role', ''), 20)
    content = clean_string(data.get('content', ''), 100_000)

    if not role or not content:
        return jsonify({'error': 'Missing role or content'}), 400
    if not _is_valid_role(role):
        return jsonify({'error': 'Invalid message role'}), 400

    try:
        session = get('chat_sessions', {'id': session_id, 'userId': g.user_id})
        if not session:
            return jsonify({'error': 'Chat session not found'}), 404

        message = insert('chat_messages', {
            'id': generate_id('msg'),
            'sessionId': session_id,
            'role': role,
            'content': content
        })

        # 更新会话的 updatedAt
        update('chat_sessions', session_id, {})

        return jsonify(message)
    except Exception as e:
        return handle_server_error(e)


@chat_bp.route('/api/chat/sessions/<session_id>', methods=['DELETE'])
@authenticate
def delete_session(session_id):
    try:
        session = get('chat_sessions', {'id': session_id, 'userId': g.user_id})
        if not session:
            return jsonify({'error': 'Chat session not found'}), 404

        def do_delete():
            remove('chat_messages', {'sessionId': session_id})
            remove('chat_sessions', {'id': session_id})

        transaction(do_delete)
        return jsonify({'success': True})
    except Exception as e:
        return handle_server_error(e)
