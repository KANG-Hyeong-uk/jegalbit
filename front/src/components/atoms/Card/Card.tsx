/**
 * Card 컴포넌트 (Atomic Design - Atom)
 *
 * 스타일링: Tailwind CSS 사용
 * 이유: 유틸리티 클래스 기반의 빠른 스타일링
 *
 * 사용 예시:
 * <Card padding="md" shadow="md" hoverable>
 *   <h3>카드 제목</h3>
 *   <p>카드 내용</p>
 * </Card>
 */

import React from 'react';
import type { BaseComponentProps, ClickableProps } from '@types/component';

/**
 * Card Props
 */
export interface CardProps extends BaseComponentProps, ClickableProps {
  /**
   * 패딩 크기
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * 그림자 크기
   * @default 'base'
   */
  shadow?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl';

  /**
   * 테두리 둥글기
   * @default 'md'
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * 호버 효과 사용 여부
   * @default false
   */
  hoverable?: boolean;

  /**
   * 테두리 표시 여부
   * @default false
   */
  bordered?: boolean;

  /**
   * 배경색
   * @default 'white'
   */
  background?: 'white' | 'gray' | 'transparent';
}

/**
 * 패딩 매핑
 */
const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

/**
 * 그림자 매핑
 */
const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

/**
 * 둥글기 매핑
 */
const roundedMap = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * 배경색 매핑
 */
const backgroundMap = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  transparent: 'bg-transparent',
};

/**
 * Card 컴포넌트
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      padding = 'md',
      shadow = 'base',
      rounded = 'md',
      hoverable = false,
      bordered = false,
      background = 'white',
      disabled = false,
      onClick,
      className = '',
      style,
      testId,
      ...rest
    },
    ref
  ) => {
    const classes = [
      // 기본 스타일
      'transition-all duration-250 ease-in-out',

      // 패딩
      paddingMap[padding],

      // 그림자
      shadowMap[shadow],

      // 둥글기
      roundedMap[rounded],

      // 배경색
      backgroundMap[background],

      // 테두리
      bordered ? 'border border-gray-200' : '',

      // 호버 효과
      hoverable && !disabled
        ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        : '',

      // 클릭 가능
      onClick && !disabled ? 'cursor-pointer' : '',

      // 비활성화
      disabled ? 'opacity-50 cursor-not-allowed' : '',

      // 사용자 정의 클래스
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled && onClick) {
        onClick(event);
      }
    };

    return (
      <div
        ref={ref}
        className={classes}
        style={style}
        onClick={handleClick}
        data-testid={testId}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        aria-disabled={disabled}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
