/**
 * Sistema de estilos global
 * Basado en el landing design moderno
 */

export const colors = {
  // Primario
  primary: '#4ECDC4',
  primaryLight: '#6FE3DB',
  primaryDark: '#2DB8AE',

  // Neutrales
  background: '#F5F7F9',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1A1F36',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Estados
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Especiales
  overlay: 'rgba(0, 0, 0, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const typography = {
  h1: {
    fontSize: 52,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h4: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
