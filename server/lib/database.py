import sqlite3
import os
import sys
from pathlib import Path

# 数据库路径
_db_dir = os.environ.get('DB_DIR', str(Path(__file__).parent.parent / 'data'))
_db_path = os.environ.get('DB_PATH', os.path.join(_db_dir, 'app.db'))

_conn = None

# 表名白名单，防止 SQL 注入
VALID_TABLES = {
    'users', 'knowledge_bases', 'documents', 'document_chunks',
    'chat_sessions', 'chat_messages', 'agent_sessions', 'tasks'
}

# 列名白名单，防止 SQL 注入
VALID_COLUMNS = {
    'id', 'username', 'email', 'passwordHash', 'salt', 'role', 'createdAt', 'updatedAt',
    'name', 'description', 'category', 'userId', 'kbId',
    'title', 'content', 'fileType', 'docId', 'text', 'vector', 'contentHash', 'chunkIndex', 'charCount',
    'sessionId', 'timestamp', 'skillId',
    'goal', 'plan', 'steps', 'finalOutput', 'phase',
    'status', 'priority', 'dueDate'
}


def _validate_table(table):
    if table not in VALID_TABLES:
        raise ValueError(f'Invalid table name: {table}')


def _validate_columns(columns):
    for col in columns:
        if col not in VALID_COLUMNS:
            raise ValueError(f'Invalid column name: {col}')


def _build_where(conditions):
    """构建 WHERE 子句，返回 (sql片段, 参数列表)"""
    if not conditions:
        return '', []
    keys = list(conditions.keys())
    _validate_columns(keys)
    clauses = [f'{k} = ?' for k in keys]
    return 'WHERE ' + ' AND '.join(clauses), list(conditions.values())


def _row_to_dict(row):
    """将 sqlite3 Row 转为 dict"""
    if row is None:
        return None
    return dict(row)


def connect_db():
    """连接数据库并初始化表结构"""
    global _conn
    try:
        os.makedirs(_db_dir, exist_ok=True)
        _conn = sqlite3.connect(_db_path, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.execute('PRAGMA journal_mode = WAL')
        _conn.execute('PRAGMA foreign_keys = ON')
        _create_tables()
        print(f'[Database] Connected to SQLite: {_db_path}')
    except Exception as e:
        print(f'[Database] Connection failed: {e}')
        sys.exit(1)


def get_connection():
    """获取数据库连接"""
    return _conn


def _create_tables():
    """创建所有表和索引"""
    cur = _conn.cursor()
    cur.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id           TEXT PRIMARY KEY,
            username     TEXT UNIQUE NOT NULL,
            email        TEXT UNIQUE,
            passwordHash TEXT NOT NULL,
            salt         TEXT NOT NULL,
            role         TEXT DEFAULT 'user',
            createdAt    TEXT DEFAULT (datetime('now')),
            updatedAt    TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS knowledge_bases (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            description TEXT DEFAULT '',
            category    TEXT DEFAULT '',
            userId      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            createdAt   TEXT DEFAULT (datetime('now')),
            updatedAt   TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS documents (
            id        TEXT PRIMARY KEY,
            title     TEXT NOT NULL,
            content   TEXT NOT NULL,
            fileType  TEXT DEFAULT 'txt',
            kbId      TEXT NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS document_chunks (
            id          TEXT PRIMARY KEY,
            docId       TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            kbId        TEXT NOT NULL,
            text        TEXT NOT NULL,
            vector      TEXT DEFAULT '[]',
            contentHash TEXT DEFAULT '',
            chunkIndex  INTEGER DEFAULT 0,
            charCount   INTEGER DEFAULT 0,
            createdAt   TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS chat_sessions (
            id        TEXT PRIMARY KEY,
            title     TEXT DEFAULT '新对话',
            userId    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            kbId      TEXT REFERENCES knowledge_bases(id) ON DELETE SET NULL,
            skillId   TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id        TEXT PRIMARY KEY,
            sessionId TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
            role      TEXT NOT NULL,
            content   TEXT NOT NULL,
            timestamp TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS agent_sessions (
            id          TEXT PRIMARY KEY,
            goal        TEXT NOT NULL,
            plan        TEXT,
            steps       TEXT,
            finalOutput TEXT,
            phase       TEXT DEFAULT 'planning',
            userId      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            createdAt   TEXT DEFAULT (datetime('now')),
            updatedAt   TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            description TEXT DEFAULT '',
            status      TEXT DEFAULT 'pending',
            priority    TEXT DEFAULT 'medium',
            dueDate     INTEGER,
            userId      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            createdAt   TEXT DEFAULT (datetime('now')),
            updatedAt   TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_chunks_kbId ON document_chunks(kbId);
        CREATE INDEX IF NOT EXISTS idx_chunks_contentHash ON document_chunks(contentHash);
        CREATE INDEX IF NOT EXISTS idx_chunks_docId ON document_chunks(docId);
        CREATE INDEX IF NOT EXISTS idx_documents_kbId ON documents(kbId);
        CREATE INDEX IF NOT EXISTS idx_knowledge_bases_userId ON knowledge_bases(userId);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_userId ON chat_sessions(userId);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_sessionId ON chat_messages(sessionId);
        CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId);
    ''')
    _conn.commit()

    # 迁移：确保 tasks 表有 dueDate 列
    _ensure_column('tasks', 'dueDate', 'INTEGER')


def _ensure_column(table, column, definition):
    """检查并添加缺失的列"""
    _validate_table(table)
    _validate_columns([column])
    # 只允许安全的类型定义
    allowed_types = {'TEXT', 'INTEGER', 'REAL', 'BLOB', 'TEXT DEFAULT \'\'', 'INTEGER DEFAULT 0'}
    if definition not in allowed_types:
        raise ValueError(f'Invalid column definition: {definition}')
    cur = _conn.cursor()
    columns = [row[1] for row in cur.execute(f'PRAGMA table_info({table})').fetchall()]
    if column not in columns:
        cur.execute(f'ALTER TABLE {table} ADD COLUMN {column} {definition}')
        _conn.commit()


# ── 通用 CRUD 函数 ──

def get(table, conditions=None):
    """查询单条记录"""
    _validate_table(table)
    conditions = conditions or {}
    where_sql, params = _build_where(conditions)
    cur = _conn.cursor()
    row = cur.execute(f'SELECT * FROM {table} {where_sql} LIMIT 1', params).fetchone()
    return _row_to_dict(row)


def query(table, conditions=None):
    """查询多条记录"""
    _validate_table(table)
    conditions = conditions or {}
    where_sql, params = _build_where(conditions)
    cur = _conn.cursor()
    # chat_messages 表用 timestamp 而不是 createdAt
    order_col = 'timestamp' if table == 'chat_messages' else 'createdAt'
    rows = cur.execute(f'SELECT * FROM {table} {where_sql} ORDER BY {order_col} DESC', params).fetchall()
    return [_row_to_dict(r) for r in rows]


def insert(table, data):
    """插入记录并返回完整行"""
    _validate_table(table)
    keys = list(data.keys())
    _validate_columns(keys)
    values = list(data.values())
    placeholders = ', '.join(['?'] * len(keys))
    col_names = ', '.join(keys)
    cur = _conn.cursor()
    cur.execute(f'INSERT INTO {table} ({col_names}) VALUES ({placeholders})', values)
    _conn.commit()
    row = cur.execute(f'SELECT * FROM {table} WHERE id = ?', (data['id'],)).fetchone()
    return _row_to_dict(row) or data


def update(table, id, data):
    """按 ID 更新记录"""
    _validate_table(table)
    keys = list(data.keys())
    if keys:
        _validate_columns(keys)
        values = list(data.values())
        set_clause = ', '.join([f'{k} = ?' for k in keys])
        cur = _conn.cursor()
        result = cur.execute(
            f"UPDATE {table} SET {set_clause}, updatedAt = datetime('now') WHERE id = ?",
            values + [id]
        )
        _conn.commit()
        return {'changes': result.rowcount}
    # 仅更新 updatedAt
    cur = _conn.cursor()
    result = cur.execute(f"UPDATE {table} SET updatedAt = datetime('now') WHERE id = ?", (id,))
    _conn.commit()
    return {'changes': result.rowcount}


def remove(table, conditions=None):
    """删除记录"""
    _validate_table(table)
    conditions = conditions or {}
    where_sql, params = _build_where(conditions)
    cur = _conn.cursor()
    result = cur.execute(f'DELETE FROM {table} {where_sql}', params)
    _conn.commit()
    return {'changes': result.rowcount}


def count(table, conditions=None):
    """统计记录数"""
    _validate_table(table)
    conditions = conditions or {}
    where_sql, params = _build_where(conditions)
    cur = _conn.cursor()
    row = cur.execute(f'SELECT COUNT(*) as cnt FROM {table} {where_sql}', params).fetchone()
    return row['cnt']


def transaction(fn):
    """在事务中执行函数"""
    cur = _conn.cursor()
    try:
        cur.execute('BEGIN')
        result = fn()
        _conn.commit()
        return result
    except Exception:
        _conn.rollback()
        raise
