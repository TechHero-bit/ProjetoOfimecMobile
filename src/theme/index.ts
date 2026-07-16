/**
 * Design System — OfimecMobile
 * Material Design 3 - Modern Design Language
 */

export const COLORS = {
  // Primary Colors
  primary: '#ffb3ad',
  primaryContainer: '#be2528',
  onPrimary: '#680009',
  onPrimaryContainer: '#ffd6d2',
  primaryFixed: '#ffdad6',
  primaryFixedDim: '#ffb3ad',
  onPrimaryFixed: '#410003',
  onPrimaryFixedVariant: '#930011',

  // Secondary Colors
  secondary: '#c8c6c5',
  secondaryContainer: '#474746',
  onSecondary: '#303030',
  onSecondaryContainer: '#b7b5b4',
  secondaryFixed: '#e5e2e1',
  secondaryFixedDim: '#c8c6c5',
  onSecondaryFixed: '#1b1b1c',
  onSecondaryFixedVariant: '#474746',

  // Tertiary Colors
  tertiary: '#c8c6c8',
  tertiaryContainer: '#636264',
  onTertiary: '#303032',
  onTertiaryContainer: '#e1dee1',
  tertiaryFixed: '#e4e2e4',
  tertiaryFixedDim: '#c8c6c8',
  onTertiaryFixed: '#1b1b1d',
  onTertiaryFixedVariant: '#474649',

  // Surface & Background
  background: '#121318',
  surface: '#121318',
  surfaceDim: '#121318',
  surfaceBright: '#38393e',
  surfaceContainer: '#1e1f24',
  surfaceContainerLow: '#1a1b20',
  surfaceContainerHigh: '#292a2f',
  surfaceContainerHighest: '#33353a',
  surfaceContainerLowest: '#0d0e12',
  surfaceVariant: '#33353a',
  onSurface: '#e3e2e8',
  onSurfaceVariant: '#e3beba',

  // Error Colors
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Outline
  outline: '#aa8986',
  outlineVariant: '#5b403e',

  // Additional
  inverseSurface: '#e3e2e8',
  inverseOnSurface: '#2f3035',
  inversePrimary: '#b72024',
  surfaceTint: '#ffb3ad',

  // Status Colors
  statusPendente: '#F59E0B',
  statusEmAndamento: '#3B82F6',
  statusConcluida: '#10B981',
  statusCancelada: '#EF4444',

  // Web-matched UI tokens
  successGreen: '#4ade80',
  successGreenBg: '#1A2E1A',
  warningYellow: '#facc15',
  warningYellowBg: '#2E2E1A',
  inputBg: '#2C2C2E',
  inputBorder: '#3A3A3C',

  // Legacy compatibility (re-mapped to new dark colors)
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#1a1b20',
  gray200: '#1e1f24',
  gray300: '#292a2f',
  gray400: '#33353a',
  gray500: '#5b403e',
  gray600: '#aa8986',
  gray700: '#e3beba',
  gray800: '#e3e2e8',
  gray900: '#ffffff',

  // Semantic (legacy)
  border: '#5b403e',
  text: '#e3e2e8',
  textSecondary: '#e3beba',
  textMuted: '#aa8986',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#ffb4ab',
  info: '#3B82F6',
} as const;

// Material Design 3 Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

export const TYPOGRAPHY = {
  displayLg: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.02,
  },
  statLg: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  headlineLg: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700' as const,
    letterSpacing: -0.02,
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  headlineSm: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.05,
  },
  labelCaps: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.05,
    textTransform: 'uppercase' as const,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  margin: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  default: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999,
} as const;

// Material Design 3 - Elevation/Shadow Levels
export const SHADOWS = {
  level0: {
    shadowColor: COLORS.black,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  level2: {
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
} as const;
