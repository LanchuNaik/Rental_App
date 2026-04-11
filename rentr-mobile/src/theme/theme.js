// ============================================
// Rentr App Theme
// ============================================
// This file holds ALL design values for the app.
// Colors, fonts, spacing, etc. — all in one place.
//
// Usage in any screen:
//   import { colors, spacing, typography } from '../theme/theme';
//   <View style={{ backgroundColor: colors.primary }} />
// ============================================

export const colors = {
  // Brand colors
  primary: '#0F766E',        // Deep Teal — main brand color
  primaryDark: '#0A5550',    // Button pressed state
  primaryLight: '#CCFBF1',   // Light backgrounds, badges

  // Accent — for important CTAs
  accent: '#F97316',         // Coral
  accentDark: '#C2410C',

  // Status colors
  success: '#10B981',        // Green — success, completed
  warning: '#F59E0B',        // Amber — pending, warning
  error: '#EF4444',          // Red — errors, cancelled
  info: '#3B82F6',           // Blue — info messages

  // Neutrals
  background: '#FFFFFF',     // Main screen background
  surface: '#F9FAFB',        // Cards, input backgrounds
  border: '#E5E7EB',         // Dividers, borders

  // Text
  textPrimary: '#111827',    // Main text
  textSecondary: '#6B7280',  // Subtitles, descriptions
  textMuted: '#9CA3AF',      // Placeholders, disabled
  textInverse: '#FFFFFF',    // Text on dark backgrounds

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
};

// ============================================
// Typography — font sizes and weights
// ============================================
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
};

// ============================================
// Spacing — use these for margins and paddings
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ============================================
// Border radius
// ============================================
export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// ============================================
// Shadows (iOS + Android)
// ============================================
export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Export all as a single theme object too (optional shortcut)
export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
};
