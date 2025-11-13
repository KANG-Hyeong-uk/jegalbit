/**
 * API 관련 타입 정의
 */

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T = unknown> {
  /**
   * 응답 데이터
   */
  data: T;

  /**
   * 상태 코드
   */
  status: number;

  /**
   * 상태 메시지
   */
  message: string;

  /**
   * 타임스탬프
   */
  timestamp: string;
}

/**
 * API 에러 응답
 */
export interface ApiError {
  /**
   * 에러 코드
   */
  code: string;

  /**
   * 에러 메시지
   */
  message: string;

  /**
   * 상세 에러 정보
   */
  details?: Record<string, unknown>;

  /**
   * 타임스탬프
   */
  timestamp: string;
}

/**
 * 페이지네이션된 API 응답
 */
export interface PaginatedResponse<T> {
  /**
   * 데이터 목록
   */
  items: T[];

  /**
   * 현재 페이지
   */
  page: number;

  /**
   * 페이지 크기
   */
  pageSize: number;

  /**
   * 전체 아이템 수
   */
  totalItems: number;

  /**
   * 전체 페이지 수
   */
  totalPages: number;

  /**
   * 다음 페이지 존재 여부
   */
  hasNext: boolean;

  /**
   * 이전 페이지 존재 여부
   */
  hasPrevious: boolean;
}

/**
 * API 요청 옵션
 */
export interface ApiRequestOptions {
  /**
   * 타임아웃 (ms)
   */
  timeout?: number;

  /**
   * 헤더
   */
  headers?: Record<string, string>;

  /**
   * 쿼리 파라미터
   */
  params?: Record<string, string | number | boolean>;

  /**
   * 재시도 횟수
   */
  retries?: number;

  /**
   * 캐시 사용 여부
   */
  cache?: boolean;
}

/**
 * 인증 토큰 타입
 */
export interface AuthTokens {
  /**
   * 액세스 토큰
   */
  accessToken: string;

  /**
   * 리프레시 토큰
   */
  refreshToken: string;

  /**
   * 만료 시간 (초)
   */
  expiresIn: number;
}

/**
 * 사용자 정보 타입 (예시)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
  updatedAt: string;
}

/**
 * React Query용 타입
 */
export interface QueryConfig<TData = unknown, TError = ApiError> {
  /**
   * 쿼리 키
   */
  queryKey: unknown[];

  /**
   * 쿼리 함수
   */
  queryFn: () => Promise<TData>;

  /**
   * 캐시 시간 (ms)
   */
  staleTime?: number;

  /**
   * GC 시간 (ms)
   */
  cacheTime?: number;

  /**
   * 재시도 횟수
   */
  retry?: number | boolean;

  /**
   * 에러 콜백
   */
  onError?: (error: TError) => void;

  /**
   * 성공 콜백
   */
  onSuccess?: (data: TData) => void;

  /**
   * 활성화 여부
   */
  enabled?: boolean;
}

/**
 * Mutation 설정 타입
 */
export interface MutationConfig<TData = unknown, TVariables = unknown, TError = ApiError> {
  /**
   * Mutation 함수
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * 성공 콜백
   */
  onSuccess?: (data: TData, variables: TVariables) => void;

  /**
   * 에러 콜백
   */
  onError?: (error: TError, variables: TVariables) => void;

  /**
   * 완료 콜백 (성공/실패 무관)
   */
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}
