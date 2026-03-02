/**
 * Design system tokens inspired by Shadcn UI
 * Focused on a premium, cinematic dark mode experience.
 */

import { Platform } from 'react-native';

export const Colors = {
  // Vibrant accents
  primary: '#E11D48', // Cinematic Red (like Netflix)
  secondary: '#3B82F6', // Action Blue
  
  dark: {
    // Core Colors
    background: '#09090b', // Deepest black-grey
    foreground: '#fafafa', // Soft white
    
    // UI Elements
    card: '#18181b',
    cardForeground: '#fafafa',
    
    popover: '#09090b',
    popoverForeground: '#fafafa',
    
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    
    accent: '#27272a',
    accentForeground: '#fafafa',
    
    destructive: '#7f1d1d',
    destructiveForeground: '#fafafa',
    
    // Borders & Inputs
    border: '#27272a',
    input: '#27272a',
    ring: '#d4d4d8',
    
    // Tab Bar
    tabBar: '#18181b',
    tabIconDefault: '#71717a',
    tabIconSelected: '#E11D48',
    secondary: '#3B82F6',
  },
  
  light: {
    // Keep a basic light mode but prioritize dark for movie apps
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    cardForeground: '#09090b',
    popover: '#ffffff',
    popoverForeground: '#09090b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    accent: '#f4f4f5',
    accentForeground: '#09090b',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#09090b',
    tabBar: '#ffffff',
    tabIconDefault: '#a1a1aa',
    tabIconSelected: '#E11D48',
  }
};

export const Spacing = {
  container: 20,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: { sans: 'System' },
  android: { sans: 'sans-serif' },
  default: { sans: 'system-ui' },
});
