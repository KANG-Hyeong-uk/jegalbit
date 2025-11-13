/**
 * Button 컴포넌트 (Atomic Design - Atom)
 *
 * 스타일링: Styled-components 사용
 * 이유: 동적 스타일링 및 props 기반 변형이 용이
 *
 * 사용 예시:
 * <Button variant="solid" color="primary" size="md" onClick={handleClick}>
 *   클릭하세요
 * </Button>
 */

import React from 'react';
import styled, { css } from 'styled-components';
import type { BaseComponentProps, ClickableProps, LoadableProps, IconProps } from '@types/component';
import type { Size, ColorVariant, ButtonVariant } from '@types/common';

/**
 * Button Props
 */
export interface ButtonProps
  extends BaseComponentProps,
    ClickableProps,
    LoadableProps,
    IconProps {
  /**
   * 버튼 변형 스타일
   * @default 'solid'
   */
  variant?: ButtonVariant;

  /**
   * 버튼 색상
   * @default 'primary'
   */
  color?: ColorVariant;

  /**
   * 버튼 크기
   * @default 'md'
   */
  size?: Size;

  /**
   * 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 버튼 타입
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Styled Button Component
 */
const StyledButton = styled.button<ButtonProps>`
  /* 기본 스타일 */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.duration.base} ${({ theme }) => theme.transitions.easing.inOut};
  outline: none;
  text-decoration: none;
  white-space: nowrap;

  /* 비활성화 상태 */
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    `}

  /* 로딩 상태 */
  ${({ isLoading }) =>
    isLoading &&
    css`
      opacity: 0.7;
      cursor: wait;
    `}

  /* 전체 너비 */
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  /* 크기 */
  ${({ size = 'md', theme }) => {
    switch (size) {
      case 'xs':
        return css`
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          font-size: ${theme.typography.fontSize.xs};
          min-height: 28px;
        `;
      case 'sm':
        return css`
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 36px;
        `;
      case 'md':
        return css`
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          font-size: ${theme.typography.fontSize.base};
          min-height: 40px;
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing[3]} ${theme.spacing[5]};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 48px;
        `;
      case 'xl':
        return css`
          padding: ${theme.spacing[4]} ${theme.spacing[6]};
          font-size: ${theme.typography.fontSize.xl};
          min-height: 56px;
        `;
      default:
        return '';
    }
  }}

  /* 색상 및 변형 */
  ${({ variant = 'solid', color = 'primary', theme }) => {
    const colorPalette = theme.colors[color] || theme.colors.primary;
    const mainColor = typeof colorPalette === 'object' ? colorPalette[500] : colorPalette;
    const hoverColor = typeof colorPalette === 'object' ? colorPalette[600] : colorPalette;
    const lightColor = typeof colorPalette === 'object' ? colorPalette[50] : colorPalette;

    switch (variant) {
      case 'solid':
        return css`
          background-color: ${mainColor};
          color: ${theme.colors.white};

          &:hover:not(:disabled) {
            background-color: ${hoverColor};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: ${mainColor};
          border: 2px solid ${mainColor};

          &:hover:not(:disabled) {
            background-color: ${lightColor};
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${mainColor};

          &:hover:not(:disabled) {
            background-color: ${lightColor};
          }
        `;
      case 'link':
        return css`
          background-color: transparent;
          color: ${mainColor};
          padding: 0;
          min-height: auto;

          &:hover:not(:disabled) {
            text-decoration: underline;
          }
        `;
      default:
        return '';
    }
  }}

  /* 포커스 스타일 */
  &:focus-visible {
    outline: 2px solid ${({ theme, color = 'primary' }) => {
      const colorPalette = theme.colors[color] || theme.colors.primary;
      return typeof colorPalette === 'object' ? colorPalette[500] : colorPalette;
    }};
    outline-offset: 2px;
  }
`;

/**
 * 로딩 스피너 컴포넌트
 */
const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Button 컴포넌트
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      color = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      type = 'button',
      onClick,
      className,
      style,
      testId,
      ...rest
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        type={type}
        variant={variant}
        color={color}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled || isLoading}
        isLoading={isLoading}
        onClick={onClick}
        className={className}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {isLoading && <Spinner />}
        {!isLoading && leftIcon && <span>{leftIcon}</span>}
        <span>{isLoading && loadingText ? loadingText : children}</span>
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
