from flask import Blueprint, request, jsonify, g
from lib.database import get, query, insert, update, remove, count, transaction
from lib.auth import authenticate
from lib.utils import generate_id, clean_string, handle_server_error

kb_bp = Blueprint('knowledge_base', __name__)


@kb_bp.route('/api/kbs', methods=['GET'])
@authenticate
def list_kbs():
    try:
        kbs = query('knowledge_bases', {'userId': g.user_id})
        result = []
        for kb in kbs:
            kb_dict = dict(kb)
            kb_dict['documentCount'] = count('documents', {'kbId': kb['id']})
            result.append(kb_dict)
        return jsonify(result)
    except Exception as e:
        return handle_server_error(e)


@kb_bp.route('/api/kbs', methods=['POST'])
@authenticate
def create_kb():
    data = request.get_json() or {}
    name = clean_string(data.get('name', ''), 80)
    description = clean_string(data.get('description', '') or '', 500)
    category = clean_string(data.get('category', '') or '', 40)

    if not name:
        return jsonify({'error': 'Missing name'}), 400

    try:
        kb = insert('knowledge_bases', {
            'id': generate_id('kb'),
            'name': name,
            'description': description,
            'category': category,
            'userId': g.user_id
        })
        return jsonify(kb)
    except Exception as e:
        return handle_server_error(e)


@kb_bp.route('/api/kbs/<kb_id>', methods=['GET'])
@authenticate
def get_kb(kb_id):
    try:
        kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Knowledge base not found'}), 404

        docs = query('documents', {'kbId': kb_id})
        result = dict(kb)
        result['documents'] = docs
        return jsonify(result)
    except Exception as e:
        return handle_server_error(e)


@kb_bp.route('/api/kbs/<kb_id>', methods=['PUT'])
@authenticate
def update_kb(kb_id):
    data = request.get_json() or {}
    name = clean_string(data['name'], 80) if 'name' in data else None
    description = clean_string(data['description'], 500) if 'description' in data else None
    category = clean_string(data['category'], 40) if 'category' in data else None

    if name is not None and name == '':
        return jsonify({'error': 'Missing name'}), 400

    try:
        kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Knowledge base not found'}), 404

        update_data = {}
        if name is not None:
            update_data['name'] = name
        if description is not None:
            update_data['description'] = description
        if category is not None:
            update_data['category'] = category

        if update_data:
            update('knowledge_bases', kb_id, update_data)
        return jsonify({'success': True})
    except Exception as e:
        return handle_server_error(e)


@kb_bp.route('/api/kbs/<kb_id>', methods=['DELETE'])
@authenticate
def delete_kb(kb_id):
    try:
        kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Knowledge base not found'}), 404

        def do_delete():
            remove('document_chunks', {'kbId': kb_id})
            remove('documents', {'kbId': kb_id})
            remove('chat_sessions', {'kbId': kb_id})
            remove('knowledge_bases', {'id': kb_id})

        transaction(do_delete)
        return jsonify({'success': True})
    except Exception as e:
        return handle_server_error(e)
