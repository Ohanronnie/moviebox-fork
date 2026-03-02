import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import type { SubjectItem, BannerItem } from '@/lib/types';
import { POSTER_ASPECT } from '@/constants/images';
import { capitalizeTitle } from '@/lib/utils';

function getImageUrl(item: SubjectItem | BannerItem): string | null {
  const img = 'image' in item ? item.image : (item as SubjectItem).cover;
  return img?.url ?? null;
}

interface PosterCardProps {
  item: SubjectItem | BannerItem;
  onPress: () => void;
  width?: number;
  showRating?: boolean;
  containerStyle?: { marginRight?: number; marginBottom?: number };
}

const posterHeight = (w: number) => Math.round(w / POSTER_ASPECT);

export function PosterCard({ item, onPress, width = 160, showRating = true, containerStyle }: PosterCardProps) {
  const imageUrl = getImageUrl(item);
  const height = posterHeight(width);
  const rating =
    'imdbRatingValue' in item && item.imdbRatingValue != null
      ? String(item.imdbRatingValue)
      : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        width,
      
        marginRight: containerStyle?.marginRight ?? 10,
        marginBottom: containerStyle?.marginBottom ?? 8,
      })}
    >
      <View
        style={{
          width,
          height,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#27272a',
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width, height }}
            contentFit="cover"
          />
        ) : (
          <View style={{ width, height, backgroundColor: '#3f3f46' }} />
        )}
        {showRating && rating && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#E11D48',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{rating}</Text>
          </View>
        )}
      </View>
      <Text
        style={{ marginTop: 8, color: '#fafafa', fontWeight: '600', width, maxWidth: width }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {capitalizeTitle(item.title)}
      </Text>
      {'releaseDate' in item && (item as { releaseDate?: string }).releaseDate && (
        <Text style={{ color: '#71717a', fontSize: 12 }}>
          {(item as { releaseDate: string }).releaseDate.slice(0, 4)}
        </Text>
      )}
    </Pressable>
  );
}
