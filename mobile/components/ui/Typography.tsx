import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'p' | 'lead' | 'large' | 'small' | 'muted';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function Typography({ 
  variant = 'p', 
  weight, 
  style, 
  ...props 
}: TypographyProps) {
  const { colors } = useTheme();

  const getWeight = () => {
    if (weight) return weight;
    if (variant === 'h1' || variant === 'h2' || variant === 'h3') return 'bold';
    if (variant === 'large') return 'semibold';
    return 'normal';
  };

  return (
    <Text
      style={[
        styles.base,
        { color: variant === 'muted' ? colors.mutedForeground : colors.foreground },
        styles[variant],
        { fontWeight: getWeight() },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
  },
  p: {
    fontSize: 16,
    lineHeight: 24,
  },
  lead: {
    fontSize: 18,
    lineHeight: 28,
  },
  large: {
    fontSize: 18,
    lineHeight: 28,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
});
