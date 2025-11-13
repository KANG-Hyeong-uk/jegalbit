/**
 * 컴포넌트 관련 타입 정의
 */

import { ReactNode, CSSProperties } from 'react';

/**
 * 기본 컴포넌트 Props
 */
export interface BaseComponentProps {
  /**
   * CSS 클래스명
   */
  className?: string;

  /**
   * 인라인 스타일
   */
  style?: CSSProperties;

  /**
   * 테스트 ID
   */
  testId?: string;

  /**
   * 자식 요소
   */
  children?: ReactNode;
}

/**
 * 클릭 가능한 컴포넌트 Props
 */
export interface ClickableProps {
  /**
   * 클릭 이벤트 핸들러
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * 비활성화 상태
   */
  disabled?: boolean;
}

/**
 * 폼 컴포넌트 Props
 */
export interface FormComponentProps<T = string> {
  /**
   * 입력 값
   */
  value?: T;

  /**
   * 기본 값
   */
  defaultValue?: T;

  /**
   * 값 변경 핸들러
   */
  onChange?: (value: T) => void;

  /**
   * 이름
   */
  name?: string;

  /**
   * 필수 입력 여부
   */
  required?: boolean;

  /**
   * 읽기 전용 여부
   */
  readOnly?: boolean;

  /**
   * 비활성화 상태
   */
  disabled?: boolean;

  /**
   * 에러 메시지
   */
  error?: string;

  /**
   * 도움말 텍스트
   */
  helperText?: string;
}

/**
 * 레이블이 있는 컴포넌트 Props
 */
export interface LabeledProps {
  /**
   * 레이블 텍스트
   */
  label?: string;

  /**
   * 레이블 위치
   */
  labelPlacement?: 'top' | 'left' | 'right' | 'bottom';
}

/**
 * 아이콘이 포함된 컴포넌트 Props
 */
export interface IconProps {
  /**
   * 왼쪽 아이콘
   */
  leftIcon?: ReactNode;

  /**
   * 오른쪽 아이콘
   */
  rightIcon?: ReactNode;
}

/**
 * 로딩 상태가 있는 컴포넌트 Props
 */
export interface LoadableProps {
  /**
   * 로딩 상태
   */
  isLoading?: boolean;

  /**
   * 로딩 텍스트
   */
  loadingText?: string;
}

/**
 * 툴팁이 있는 컴포넌트 Props
 */
export interface TooltipProps {
  /**
   * 툴팁 내용
   */
  tooltip?: string;

  /**
   * 툴팁 위치
   */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * 반응형 컴포넌트 Props
 */
export interface ResponsiveProps<T> {
  /**
   * 기본 값
   */
  base?: T;

  /**
   * 모바일 (640px~)
   */
  sm?: T;

  /**
   * 태블릿 (768px~)
   */
  md?: T;

  /**
   * 데스크톱 (1024px~)
   */
  lg?: T;

  /**
   * 대형 데스크톱 (1280px~)
   */
  xl?: T;
}

/**
 * 애니메이션 Props
 */
export interface AnimationProps {
  /**
   * 애니메이션 지속 시간 (ms)
   */
  duration?: number;

  /**
   * 애니메이션 지연 (ms)
   */
  delay?: number;

  /**
   * 이징 함수
   */
  easing?: 'linear' | 'in' | 'out' | 'inOut';
}
