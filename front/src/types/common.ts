/**
 * 공통 타입 정의
 */

/**
 * 기본 크기 타입
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 색상 변형 타입
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';

/**
 * 버튼 변형 타입
 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

/**
 * 정렬 타입
 */
export type Alignment = 'left' | 'center' | 'right';

/**
 * 간격 타입
 */
export type Spacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

/**
 * 방향 타입
 */
export type Direction = 'horizontal' | 'vertical';

/**
 * 로딩 상태 타입
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * 에러 상태 타입
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

/**
 * 페이지네이션 타입
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 정렬 옵션 타입
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 필터 옵션 타입
 */
export interface FilterOptions {
  [key: string]: string | number | boolean | undefined;
}

/**
 * 검색 옵션 타입
 */
export interface SearchOptions {
  query: string;
  fields?: string[];
}
