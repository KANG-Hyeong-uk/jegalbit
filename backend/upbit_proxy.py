"""
Upbit API Proxy
업비트 API를 안전하게 프록시하는 모듈
"""
import os
import jwt
import uuid
import hashlib
import requests
from urllib.parse import urlencode, unquote
from typing import Optional, Dict, Any

# 환경변수에서 API 키 로드
ACCESS_KEY = os.getenv('UPBIT_ACCESS_KEY')
SECRET_KEY = os.getenv('UPBIT_SECRET_KEY')
UPBIT_API_BASE = 'https://api.upbit.com'


def generate_jwt_token(query_params: Optional[Dict[str, Any]] = None) -> str:
    """
    업비트 API용 JWT 토큰 생성

    Args:
        query_params: URL 쿼리 파라미터 (있는 경우)

    Returns:
        JWT 토큰 문자열
    """
    if not ACCESS_KEY or not SECRET_KEY:
        raise ValueError('UPBIT_ACCESS_KEY and UPBIT_SECRET_KEY must be set')

    payload = {
        'access_key': ACCESS_KEY,
        'nonce': str(uuid.uuid4()),
    }

    # 쿼리 파라미터가 있는 경우 query_hash 추가
    if query_params:
        query_string = unquote(urlencode(query_params, doseq=True)).encode()
        m = hashlib.sha512()
        m.update(query_string)
        query_hash = m.hexdigest()
        payload['query_hash'] = query_hash
        payload['query_hash_alg'] = 'SHA512'

    # JWT 토큰 생성
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token


def call_upbit_api(endpoint: str, method: str = 'GET', params: Optional[Dict] = None) -> Dict:
    """
    업비트 API 호출

    Args:
        endpoint: API 엔드포인트 (예: '/v1/accounts')
        method: HTTP 메서드 ('GET', 'POST' 등)
        params: 쿼리 파라미터 또는 요청 본문

    Returns:
        API 응답 데이터
    """
    url = f"{UPBIT_API_BASE}{endpoint}"

    # JWT 토큰 생성
    token = generate_jwt_token(params if method == 'GET' else None)
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
    }

    # API 호출
    if method == 'GET':
        response = requests.get(url, headers=headers, params=params)
    elif method == 'POST':
        response = requests.post(url, headers=headers, json=params)
    elif method == 'DELETE':
        response = requests.delete(url, headers=headers, params=params)
    else:
        raise ValueError(f'Unsupported HTTP method: {method}')

    # 응답 확인
    response.raise_for_status()
    return response.json()
