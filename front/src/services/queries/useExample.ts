/**
 * 예시 React Query 훅
 *
 * 실제 프로젝트에서는 각 도메인별로 파일을 분리하여 관리
 * 예: useAuth.ts, useUsers.ts, usePosts.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@services/api';
import { queryKeys } from './queryClient';
import type { User } from '@types/api';

/**
 * 사용자 목록 조회 훅
 */
export const useUsers = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters || {}),
    queryFn: () => get<User[]>('/users', { params: filters }),
    select: (data) => data.data, // data.data에서 실제 데이터 추출
  });
};

/**
 * 사용자 상세 조회 훅
 */
export const useUser = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => get<User>(`/users/${id}`),
    select: (data) => data.data,
    enabled: options?.enabled !== false && !!id,
  });
};

/**
 * 사용자 생성 훅
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<User>) => post<User>('/users', userData),
    onSuccess: () => {
      // 사용자 목록 쿼리 무효화 (다시 fetch)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      console.error('사용자 생성 실패:', error);
    },
  });
};

/**
 * 사용자 수정 훅
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      put<User>(`/users/${id}`, data),
    onSuccess: (response, variables) => {
      // 해당 사용자 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      // 사용자 목록 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * 사용자 삭제 훅
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del(`/users/${id}`),
    onSuccess: () => {
      // 사용자 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * 현재 사용자 정보 조회 훅
 */
export const useMe = () => {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => get<User>('/auth/me'),
    select: (data) => data.data,
    // 인증된 상태에서만 호출
    retry: false,
  });
};
