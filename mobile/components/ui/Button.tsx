import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator,
  View
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors, globalColors, radius, spacing } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.muted;
    switch (variant) {
      case 'primary': return globalColors.primary;
      case 'secondary': return colors.secondary;
      case 'destructive': return colors.destructive;
      case 'outline':
      case 'ghost': return 'transparent';
      default: return globalColors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.mutedForeground;
    switch (variant) {
      case 'outline': return colors.foreground;
      case 'ghost': return colors.foreground;
      case 'primary': return '#fff';
      default: return colors.foreground;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.border;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: radius.md,
          paddingHorizontal: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.xl : spacing.md,
          paddingVertical: size === 'sm' ? spacing.xs : size === 'lg' ? spacing.md : spacing.sm,
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {icon && <View style={{ marginRight: spacing.sm }}>{icon}</View>}
            <Typography 
              variant={size === 'sm' ? 'small' : 'p'} 
              weight="semibold"
              style={{ color: getTextColor() }}
            >
              {label}
            </Typography>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
