import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from './ui/Typography';
import { Badge } from './ui/Badge';

interface MovieCardProps {
  title: string;
  image: any;
  rating: string;
  year: string;
  onPress?: () => void;
  width?: number;
}

export function MovieCard({ title, image, rating, year, onPress, width = 160 }: MovieCardProps) {
  const { radius, spacing, colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      onPress={onPress}
      style={[styles.container, { width, marginRight: spacing.md }]}
    >
      <View style={[styles.imageContainer, { borderRadius: radius.lg }]}>
        <Image
          source={image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.badgeContainer}>
          <Badge label={rating} variant="primary" />
        </View>
      </View>
      
      <View style={{ marginTop: spacing.sm }}>
        <Typography variant="p" weight="semibold" numberOfLines={1}>
          {title}
        </Typography>
        <Typography variant="small" style={{ color: colors.mutedForeground }}>
          {year}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  imageContainer: {
    aspectRatio: 2/3,
    backgroundColor: '#333',
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
