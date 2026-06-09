import json
from flask import Blueprint, request, jsonify, g
from lib.database import get, query, insert, transaction
from lib.auth import authenticate
from lib.utils import generate_id, clean_string, handle_server_error

chunks_bp = Blueprint('chunks', __name__)


@chunks_bp.route('/api/chunks/batch', methods=['POST'])
@authenticate
def batch_insert_chunks():
    data = request.get_json() or {}
    chunks = data.get('chunks')
    kb_id = data.get('kbId')
    doc_id = data.get('docId')

    if not isinstance(chunks, list) or not chunks:
        return jsonify({'error': 'No chunks provided'}), 400
    if len(chunks) > 500:
        return jsonify({'error': 'Too many chunks (max 500 per batch)'}), 400

    try:
        # 校验知识库是否属于当前用户
        kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Access denied'}), 403

        doc = get('documents', {'id': doc_id})
        if not doc or doc['kbId'] != kb_id:
            return jsonify({'error': 'Invalid document for knowledge base'}), 400

        # 标准化 chunks
        normalized = []
        for index, chunk in enumerate(chunks):
            text = clean_string(chunk.get('text', '') if chunk else '', 20_000)
            vector = chunk.get('vector') if chunk else None
            if not text or not isinstance(vector, list):
                return jsonify({'error': 'Invalid chunk payload'}), 400
            normalized.append({
                'text': text,
                'vector': vector,
                'contentHash': clean_string(chunk.get('contentHash', '') or '', 128),
                'chunkIndex': index,
                'charCount': int(chunk.get('charCount', len(text))) if isinstance(chunk.get('charCount'), (int, float)) else len(text)
            })

        def do_insert():
            for chunk in normalized:
                insert('document_chunks', {
                    'id': generate_id('chunk'),
                    'docId': doc_id,
                    'kbId': kb_id,
                    'text': chunk['text'],
                    'vector': json.dumps(chunk['vector']),
                    'contentHash': chunk['contentHash'],
                    'chunkIndex': chunk['chunkIndex'],
                    'charCount': chunk['charCount']
                })

        transaction(do_insert)
        return jsonify({'count': len(chunks)})
    except Exception as e:
        return handle_server_error(e)


@chunks_bp.route('/api/chunks/kb/<kb_id>', methods=['GET'])
@authenticate
def list_chunks_by_kb(kb_id):
    try:
        # 校验知识库是否属于当前用户
        kb = get('knowledge_bases', {'id': kb_id, 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Access denied'}), 403

        chunks = query('document_chunks', {'kbId': kb_id})
        result = []
        for c in chunks:
            c_dict = dict(c)
            c_dict['vector'] = json.loads(c_dict.get('vector', '[]'))
            result.append(c_dict)
        return jsonify(result)
    except Exception as e:
        return handle_server_error(e)


@chunks_bp.route('/api/chunks/hash/<hash_value>', methods=['GET'])
@authenticate
def get_chunk_by_hash(hash_value):
    try:
        chunk = get('document_chunks', {'contentHash': hash_value})
        if not chunk:
            return jsonify({'error': 'Chunk not found'}), 404

        # 校验 chunk 所属知识库是否属于当前用户
        kb = get('knowledge_bases', {'id': chunk['kbId'], 'userId': g.user_id})
        if not kb:
            return jsonify({'error': 'Access denied'}), 403

        result = dict(chunk)
        result['vector'] = json.loads(result.get('vector', '[]'))
        return jsonify(result)
    except Exception as e:
        return handle_server_error(e)
