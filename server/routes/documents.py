from flask import Blueprint, request, jsonify, g
from lib.database import get, query, insert, remove, transaction
from lib.auth import authenticate
from lib.utils import generate_id, clean_string, handle_server_error

docs_bp = Blueprint('documents', __name__)


@docs_bp.route('/api/kbs/<kb_id>/docs', methods=['GET'])
@authenticate
def list_docs(kb_id):
    try:
        kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Knowledge base not found'}), 404
        docs = query('documents', {'kbId': kb_id})
        return jsonify(docs)
    except Exception as e:
        return handle_server_error(e)


@docs_bp.route('/api/kbs/<kb_id>/docs', methods=['POST'])
@authenticate
def create_doc(kb_id):
    data = request.get_json() or {}
    title = clean_string(data.get('title', ''), 200)
    content = clean_string(data.get('content', ''), 1_000_000)
    file_type = clean_string(data.get('fileType', 'txt') or 'txt', 20)

    if not title or not content:
        return jsonify({'error': 'Missing title or content'}), 400

    try:
        kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Knowledge base not found'}), 404

        doc = insert('documents', {
            'id': generate_id('doc'),
            'title': title,
            'content': content,
            'fileType': file_type,
            'kbId': kb_id
        })
        return jsonify(doc)
    except Exception as e:
        return handle_server_error(e)


@docs_bp.route('/api/docs/<doc_id>', methods=['GET'])
@authenticate
def get_doc(doc_id):
    try:
        doc = get('documents', {'id': doc_id})
        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        # 校验文档所属知识库是否属于当前用户
        kb = get('knowledge_bases', {'id': doc['kbId'], 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Access denied'}), 403

        return jsonify(doc)
    except Exception as e:
        return handle_server_error(e)


@docs_bp.route('/api/docs/<doc_id>', methods=['DELETE'])
@authenticate
def delete_doc(doc_id):
    try:
        doc = get('documents', {'id': doc_id})
        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        # 校验文档所属知识库是否属于当前用户
        kb = get('knowledge_bases', {'id': doc['kbId'], 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Access denied'}), 403

        def do_delete():
            remove('document_chunks', {'docId': doc_id})
            remove('documents', {'id': doc_id})

        transaction(do_delete)
        return jsonify({'success': True})
    except Exception as e:
        return handle_server_error(e)
