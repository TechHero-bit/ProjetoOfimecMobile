/**
 * Design System — OfimecMobile
 * Adaptado do padrão visual LogiTrack (Projeto A)
 */

export const COLORS = {
  // Primary — Dark Red (LogiTrack)
  primary: '#8B0000',
  primaryLight: '#A50000',
  primaryDark: '#6B0000',
  accent: '#CC0000',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',

  // Semantic
  background: '#FFFFFF',
  surface: '#F8F9FA',
  border: '#E9ECEF',
  text: '#212529',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',

  // Status
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8',

  // OS Status Colors
  statusPendente: '#FFC107',
  statusEmAndamento: '#17A2B8',
  statusConcluida: '#28A745',
  statusCancelada: '#DC3545',
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: COLORS.black,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 2,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
