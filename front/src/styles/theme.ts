/**
 * 디자인 시스템 테마 설정
 * Figma 디자인 토큰을 기반으로 구성됨
 *
 * 사용법:
 * - Styled-components: ${({ theme }) => theme.colors.primary[500]}
 * - Tailwind: bg-primary-500
 * - CSS Modules: var(--color-primary-500)
 */

export const colors = {
  // Premium Dark Theme - Blue Spectrum
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Emerald/Teal Accent
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Silver/Neutral for Dark Theme
  silver: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Dark Background Gradients
  dark: {
    bg: '#0a0e27',
    bgSecondary: '#0f1535',
    bgTertiary: '#151b3d',
    surface: '#1a2142',
    surfaceHover: '#1f2749',
    border: 'rgba(100, 116, 139, 0.2)',
    borderLight: 'rgba(148, 163, 184, 0.15)',
  },

  // Glassmorphism colors
  glass: {
    background: 'rgba(26, 33, 66, 0.7)',
    border: 'rgba(148, 163, 184, 0.15)',
    highlight: 'rgba(59, 130, 246, 0.1)',
  },

  // Gradient definitions
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
    emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    silver: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    blueEmerald: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    darkGlow: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    cardHover: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
  },

  // Semantic Colors - Dark Theme Adjusted
  success: {
    50: '#ecfdf5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },

  // Special
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', sans-serif",
    heading: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'SF Mono', 'Fira Code', 'Courier New', monospace",
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  40: '10rem',     // 160px
  48: '12rem',     // 192px
  56: '14rem',     // 224px
  64: '16rem',     // 256px
} as const;

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 2px 4px rgba(0, 0, 0, 0.4)',
  base: '0 4px 8px rgba(0, 0, 0, 0.5)',
  md: '0 8px 16px rgba(0, 0, 0, 0.6)',
  lg: '0 12px 24px rgba(0, 0, 0, 0.7)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.8)',
  '2xl': '0 32px 64px rgba(0, 0, 0, 0.9)',
  inner: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
  // Premium dark theme shadows with color accents
  glow: {
    blue: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
    emerald: '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
    silver: '0 4px 24px rgba(148, 163, 184, 0.2)',
  },
  card: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 1px rgba(59, 130, 246, 0.1)',
  cardHover: '0 12px 48px rgba(59, 130, 246, 0.3), 0 0 80px rgba(16, 185, 129, 0.15)',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  notification: 1600,
} as const;

export const transitions = {
  duration: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Premium effects for dark theme with glassmorphism
 */
export const effects = {
  backdropBlur: {
    sm: 'blur(8px)',
    md: 'blur(16px)',
    lg: 'blur(24px)',
    xl: 'blur(40px)',
  },
  glassmorphism: {
    base: {
      background: 'rgba(26, 33, 66, 0.7)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
    },
    subtle: {
      background: 'rgba(26, 33, 66, 0.5)',
      backdropFilter: 'blur(12px) saturate(150%)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    },
    strong: {
      background: 'rgba(26, 33, 66, 0.85)',
      backdropFilter: 'blur(20px) saturate(200%)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.8)',
    },
  },
  glow: {
    primary: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
    emerald: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
    soft: 'drop-shadow(0 0 12px rgba(148, 163, 184, 0.3))',
  },
} as const;

// Styled-components 테마 객체
export const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  borderRadius,
  zIndex,
  transitions,
  effects,
} as const;

export type Theme = typeof theme;

export default theme;
