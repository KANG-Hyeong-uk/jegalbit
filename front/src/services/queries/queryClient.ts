/**
 * React Query 클라이언트 설정
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

/**
 * Query Client 설정
 */
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 데이터가 stale 상태로 간주되는 시간 (5분)
      staleTime: 5 * 60 * 1000,

      // 캐시된 데이터가 메모리에서 제거되는 시간 (10분)
      gcTime: 10 * 60 * 1000,

      // 에러 발생 시 재시도 횟수
      retry: 1,

      // 재시도 지연 시간 (지수 백오프)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 윈도우 포커스 시 자동 refetch 비활성화
      refetchOnWindowFocus: false,

      // 컴포넌트 마운트 시 자동 refetch 비활성화
      refetchOnMount: false,

      // 네트워크 재연결 시 자동 refetch
      refetchOnReconnect: true,
    },
    mutations: {
      // mutation 에러 발생 시 재시도 비활성화
      retry: false,
    },
  },
};

/**
 * Query Client 인스턴스
 */
export const queryClient = new QueryClient(queryClientConfig);

/**
 * Query Key Factory
 * 일관된 쿼리 키 생성
 */
export const queryKeys = {
  // 인증
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // 사용자
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // 게시물 (예시)
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
} as const;
