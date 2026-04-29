export const colors = {
  primary: '#0078D4',
  primaryDark: '#005A9E',
  primaryLight: '#C7E0F4',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#999999',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  error: '#D32F2F',
  success: '#34C759',
  warning: '#FF9500',
  info: '#0078D4',

  // Status colors
  statusDraft: '#8E8E93',
  statusOpen: '#0078D4',
  statusInReview: '#FF9500',
  statusReceived: '#34C759',
  statusPosted: '#34C759',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
