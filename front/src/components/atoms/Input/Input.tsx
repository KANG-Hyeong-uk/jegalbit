/**
 * Input 컴포넌트 (Atomic Design - Atom)
 *
 * 스타일링: CSS Modules 사용
 * 이유: 스코프 격리 및 전통적인 CSS 방식으로 관리
 *
 * 사용 예시:
 * <Input
 *   label="이메일"
 *   placeholder="이메일을 입력하세요"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 */

import React, { useState, useCallback, ChangeEvent } from 'react';
import styles from './Input.module.css';
import type { BaseComponentProps, FormComponentProps, LabeledProps, IconProps } from '@types/component';
import type { Size } from '@types/common';

/**
 * Input Props
 */
export interface InputProps
  extends Omit<BaseComponentProps, 'children'>,
    Omit<FormComponentProps<string>, 'onChange'>,
    LabeledProps,
    IconProps {
  /**
   * input 타입
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

  /**
   * placeholder 텍스트
   */
  placeholder?: string;

  /**
   * 크기
   * @default 'md'
   */
  size?: Size;

  /**
   * 최소 길이
   */
  minLength?: number;

  /**
   * 최대 길이
   */
  maxLength?: number;

  /**
   * 패턴 (정규식)
   */
  pattern?: string;

  /**
   * 자동 완성
   */
  autoComplete?: string;

  /**
   * 자동 포커스
   */
  autoFocus?: boolean;

  /**
   * change 이벤트 핸들러
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;

  /**
   * focus 이벤트 핸들러
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * blur 이벤트 핸들러
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Input 컴포넌트
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      labelPlacement = 'top',
      placeholder,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      name,
      size = 'md',
      required = false,
      readOnly = false,
      disabled = false,
      error,
      helperText,
      leftIcon,
      rightIcon,
      minLength,
      maxLength,
      pattern,
      autoComplete,
      autoFocus,
      className,
      style,
      testId,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const togglePasswordVisibility = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const containerClasses = [
      styles.container,
      styles[`label-${labelPlacement}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.wrapper,
      styles[`size-${size}`],
      isFocused && styles.focused,
      error && styles.error,
      disabled && styles.disabled,
      readOnly && styles.readonly,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses} style={style}>
        {label && (
          <label htmlFor={name} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={wrapperClasses}>
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

          <input
            ref={ref}
            id={name}
            type={inputType}
            name={name}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            readOnly={readOnly}
            disabled={disabled}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={styles.input}
            data-testid={testId}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
            {...rest}
          />

          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.passwordToggle}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          )}

          {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </div>

        {error && (
          <span id={`${name}-error`} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}

        {!error && helperText && (
          <span id={`${name}-helper`} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
