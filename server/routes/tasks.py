from flask import Blueprint, request, jsonify, g
from lib.database import get, query, insert, update, remove
from lib.auth import authenticate
from lib.utils import generate_id, clean_string, handle_server_error

tasks_bp = Blueprint('tasks', __name__)

ALLOWED_STATUSES = ['pending', 'todo', 'in_progress', 'completed']
ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'urgent']


def _normalize_due_date(value):
    """标准化 dueDate 值"""
    if value is None:
        return {'provided': True, 'value': None, 'invalid': False}
    if isinstance(value, str) and value == '':
        return {'provided': True, 'value': None, 'invalid': False}
    try:
        timestamp = int(value)
        return {'provided': True, 'value': timestamp, 'invalid': False}
    except (ValueError, TypeError):
        return {'provided': True, 'value': None, 'invalid': True}


@tasks_bp.route('/api/tasks', methods=['GET'])
@authenticate
def list_tasks():
    try:
        tasks = query('tasks', {'userId': g.user_id})
        return jsonify(tasks)
    except Exception as e:
        return handle_server_error(e)


@tasks_bp.route('/api/tasks', methods=['POST'])
@authenticate
def create_task():
    data = request.get_json() or {}
    title = clean_string(data.get('title', ''), 120)
    description = clean_string(data.get('description', '') or '', 1000)
    status = clean_string(data.get('status', 'pending') or 'pending', 30)
    priority = clean_string(data.get('priority', 'medium') or 'medium', 30)
    due_date_raw = data.get('dueDate')

    if not title:
        return jsonify({'error': 'Missing title'}), 400
    if status not in ALLOWED_STATUSES:
        return jsonify({'error': 'Invalid status'}), 400
    if priority not in ALLOWED_PRIORITIES:
        return jsonify({'error': 'Invalid priority'}), 400

    due_date = _normalize_due_date(due_date_raw)
    if due_date['invalid']:
        return jsonify({'error': 'Invalid dueDate'}), 400

    try:
        task = insert('tasks', {
            'id': generate_id('task'),
            'title': title,
            'description': description,
            'status': status,
            'priority': priority,
            'dueDate': due_date['value'],
            'userId': g.user_id
        })
        return jsonify(task)
    except Exception as e:
        return handle_server_error(e)


@tasks_bp.route('/api/tasks/<task_id>', methods=['PUT'])
@authenticate
def update_task(task_id):
    data = request.get_json() or {}
    title = clean_string(data['title'], 120) if 'title' in data else None
    description = clean_string(data['description'], 1000) if 'description' in data else None
    status = clean_string(data['status'], 30) if 'status' in data else None
    priority = clean_string(data['priority'], 30) if 'priority' in data else None
    due_date_raw = data.get('dueDate')

    if title is not None and title == '':
        return jsonify({'error': 'Missing title'}), 400
    if status is not None and status not in ALLOWED_STATUSES:
        return jsonify({'error': 'Invalid status'}), 400
    if priority is not None and priority not in ALLOWED_PRIORITIES:
        return jsonify({'error': 'Invalid priority'}), 400

    due_date = _normalize_due_date(due_date_raw) if 'dueDate' in data else None
    if due_date and due_date['invalid']:
        return jsonify({'error': 'Invalid dueDate'}), 400

    try:
        task = get('tasks', {'id': task_id, 'userId': g.user_id})
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        update_data = {}
        if title is not None:
            update_data['title'] = title
        if description is not None:
            update_data['description'] = description
        if status is not None:
            update_data['status'] = status
        if priority is not None:
            update_data['priority'] = priority
        if due_date and due_date['provided']:
            update_data['dueDate'] = due_date['value']

        if update_data:
            update('tasks', task_id, update_data)
        return jsonify({'success': True})
    except Exception as e:
        return handle_server_error(e)


@tasks_bp.route('/api/tasks/<task_id>', methods=['DELETE'])
@authenticate
def delete_task(task_id):
    try:
        task = get('tasks', {'id': task_id, 'userId': g.user_id})
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        remove('tasks', {'id': task_id})
        return jsonify({'success': True})
    except Exception as e:
        return handle_server_error(e)
