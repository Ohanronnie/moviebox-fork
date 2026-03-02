import { useColorScheme } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return {
    colors: theme,
    globalColors: {
      primary: Colors.primary,
      secondary: Colors.secondary,
    },
    spacing: Spacing,
    radius: Radius,
    isDark: colorScheme === 'dark',
  };
}
