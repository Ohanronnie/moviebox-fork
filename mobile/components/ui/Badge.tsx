import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from './Typography';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  const { colors, globalColors, radius } = useTheme();

  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: globalColors.primary, text: '#fff', border: 'transparent' };
      case 'secondary':
        return { bg: colors.secondary, text: '#fff', border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', text: colors.foreground, border: colors.border };
      case 'destructive':
        return { bg: colors.destructive, text: '#fff', border: 'transparent' };
      default:
        return { bg: globalColors.primary, text: '#fff', border: 'transparent' };
    }
  };

  const s = getStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: s.bg,
          borderColor: s.border,
          borderWidth: s.border === 'transparent' ? 0 : 1,
          borderRadius: radius.full,
        },
      ]}
    >
      <Typography variant="small" weight="semibold" style={{ color: s.text, fontSize: 10 }}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
});
