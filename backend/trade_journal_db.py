"""
매매 일지 SQLite 데이터베이스 모델
클린 아키텍처 원칙에 따라 Repository 패턴 적용
"""

import sqlite3
from datetime import datetime
from typing import List, Optional, Dict
import uuid

# 데이터베이스 파일 경로
DB_FILE = 'trade_journal.db'

def get_connection():
    """SQLite 데이터베이스 연결"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Row 객체로 결과 반환
    return conn

def init_db():
    """데이터베이스 초기화 및 테이블 생성"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('BUY', 'SELL')),
        investment_amount REAL NOT NULL DEFAULT 0,
        return_rate REAL NOT NULL,
        trade_date TEXT NOT NULL,
        memo TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    ''')

    # 인덱스 생성
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_symbol ON trades(symbol)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_type ON trades(type)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_trade_date ON trades(trade_date)')

    conn.commit()
    conn.close()

def create_trade(data: Dict) -> Dict:
    """트레이드 생성"""
    conn = get_connection()
    cursor = conn.cursor()

    trade_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    cursor.execute('''
    INSERT INTO trades (id, symbol, type, investment_amount, return_rate, trade_date, memo, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        trade_id,
        data['symbol'],
        data['type'],
        data.get('investment_amount', 0),
        data['return_rate'],
        data['trade_date'],
        data.get('memo', ''),
        now,
        now
    ))

    conn.commit()
    conn.close()

    return get_trade_by_id(trade_id)

def get_all_trades(filters: Optional[Dict] = None) -> List[Dict]:
    """모든 트레이드 조회 (필터링 옵션 포함)"""
    conn = get_connection()
    cursor = conn.cursor()

    query = 'SELECT * FROM trades WHERE 1=1'
    params = []

    if filters:
        if 'symbol' in filters and filters['symbol']:
            query += ' AND symbol = ?'
            params.append(filters['symbol'])

        if 'type' in filters and filters['type']:
            query += ' AND type = ?'
            params.append(filters['type'])

        if 'start_date' in filters and filters['start_date']:
            query += ' AND trade_date >= ?'
            params.append(filters['start_date'])

        if 'end_date' in filters and filters['end_date']:
            query += ' AND trade_date <= ?'
            params.append(filters['end_date'])

    query += ' ORDER BY trade_date DESC'

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def get_trade_by_id(trade_id: str) -> Optional[Dict]:
    """ID로 트레이드 조회"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM trades WHERE id = ?', (trade_id,))
    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None

def update_trade(trade_id: str, data: Dict) -> Optional[Dict]:
    """트레이드 수정"""
    existing = get_trade_by_id(trade_id)
    if not existing:
        return None

    conn = get_connection()
    cursor = conn.cursor()

    # 업데이트할 필드 동적 생성
    updates = []
    params = []

    if 'symbol' in data:
        updates.append('symbol = ?')
        params.append(data['symbol'])

    if 'type' in data:
        updates.append('type = ?')
        params.append(data['type'])

    if 'investment_amount' in data:
        updates.append('investment_amount = ?')
        params.append(data['investment_amount'])

    if 'return_rate' in data:
        updates.append('return_rate = ?')
        params.append(data['return_rate'])

    if 'trade_date' in data:
        updates.append('trade_date = ?')
        params.append(data['trade_date'])

    if 'memo' in data:
        updates.append('memo = ?')
        params.append(data['memo'])

    updates.append('updated_at = ?')
    params.append(datetime.now().isoformat())

    params.append(trade_id)

    query = f"UPDATE trades SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, params)
    conn.commit()
    conn.close()

    return get_trade_by_id(trade_id)

def delete_trade(trade_id: str) -> bool:
    """트레이드 삭제"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM trades WHERE id = ?', (trade_id,))
    deleted = cursor.rowcount > 0

    conn.commit()
    conn.close()

    return deleted

def get_statistics() -> Dict:
    """통계 계산"""
    conn = get_connection()
    cursor = conn.cursor()

    # 전체 통계
    cursor.execute('''
    SELECT
        COUNT(CASE WHEN type = 'BUY' THEN 1 END) as buy_count,
        COUNT(CASE WHEN type = 'SELL' THEN 1 END) as sell_count,
        COALESCE(AVG(CASE WHEN type = 'BUY' THEN return_rate ELSE NULL END), 0) as avg_buy_return,
        COALESCE(AVG(CASE WHEN type = 'SELL' THEN return_rate ELSE NULL END), 0) as avg_sell_return,
        COALESCE(AVG(return_rate), 0) as avg_total_return
    FROM trades
    ''')

    row = cursor.fetchone()

    buy_count = row['buy_count'] or 0
    sell_count = row['sell_count'] or 0
    avg_buy_return = row['avg_buy_return'] or 0
    avg_sell_return = row['avg_sell_return'] or 0
    avg_total_return = row['avg_total_return'] or 0

    conn.close()

    return {
        'total_buy_count': buy_count,
        'total_sell_count': sell_count,
        'average_buy_return': round(avg_buy_return, 2),
        'average_sell_return': round(avg_sell_return, 2),
        'average_total_return': round(avg_total_return, 2),
    }

def clear_all_trades() -> bool:
    """모든 트레이드 삭제 (개발용)"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM trades')
    conn.commit()
    conn.close()

    return True

# 앱 시작 시 DB 초기화
init_db()
