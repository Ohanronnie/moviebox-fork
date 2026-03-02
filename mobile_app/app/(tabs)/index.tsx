import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, View, Text, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Download, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHome } from '@/lib/hooks';
import { PosterCard } from '@/components/PosterCard';
import { HERO_HEIGHT } from '@/constants/images';
import { getDetailParams } from '@/lib/utils';
import type { BannerBlock, SubjectsBlock, BannerItem, SubjectItem } from '@/lib/types';

function isBannerBlock(item: unknown): item is BannerBlock {
  return typeof item === 'object' && item !== null && 'banner' in item && Array.isArray((item as BannerBlock).banner?.items);
}

function isSubjectsBlock(item: unknown): item is SubjectsBlock {
  return typeof item === 'object' && item !== null && 'subjects' in item && Array.isArray((item as SubjectsBlock).subjects);
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, error } = useHome();

  const goSearch = () => router.push('/search');
  const goItem = (item: SubjectItem | BannerItem) => {
    const { detailPath, subjectId } = getDetailParams(item);
    if (!detailPath && !subjectId) return;
    router.push({
      pathname: '/movie/[id]',
      params: { id: subjectId, detailPath, subjectId, isSeries: item.subjectType === 2 ? '1' : '0' },
    });
  };

  const bannerItem = data?.operatingList?.find(isBannerBlock)?.banner?.items?.[0];
  const subjectBlocks =
    data?.operatingList
      ?.filter(isSubjectsBlock)
      // Manually exclude unwanted sections from API
      .filter(
        (block) =>
          block.title !== 'Banner_Africa' &&
          block.title !== 'Categories'
      ) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        <View style={{ height: HERO_HEIGHT, width: '100%', position: 'relative' }}>
          {isLoading ? (
            <View style={{ flex: 1, height: HERO_HEIGHT, backgroundColor: '#18181b', justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E11D48" />
            </View>
          ) : bannerItem ? (
            <>
              <Image
                source={{ uri: bannerItem.image?.url }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: HERO_HEIGHT }}
                contentFit="cover"
              />
              <BlurView intensity={20} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: HERO_HEIGHT, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <View style={{ padding: 24, paddingBottom: 40 }}>
                  <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 8, maxWidth: '100%' }} numberOfLines={2} ellipsizeMode="tail">{bannerItem.title}</Text>
                  <Text style={{ color: '#a1a1aa', marginBottom: 24 }}>2022</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Pressable
                      onPress={() => goItem(bannerItem)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, flex: 1, backgroundColor: '#E11D48', paddingVertical: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 })}
                    >
                      <Play size={18} color="#fff" fill="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Play Now</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#52525b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 })}
                    >
                      <Download size={18} color="#fafafa" />
                      <Text style={{ color: '#fafafa', fontWeight: '600' }}>Download</Text>
                    </Pressable>
                  </View>
                </View>
              </BlurView>
            </>
          ) : isError ? (
            <View style={{ height: HERO_HEIGHT, backgroundColor: '#18181b', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ color: '#a1a1aa', textAlign: 'center' }}>{(error as Error)?.message ?? 'Failed to load'}</Text>
            </View>
          ) : (
            <View style={{ height: HERO_HEIGHT, backgroundColor: '#18181b' }} />
          )}
        </View>

        {/* Section lists from API */}
        {subjectBlocks.slice(0, 3).map((block, index) => (
          <View key={block.title} style={{ marginTop: index === 0 ? 32 : 28, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fafafa', maxWidth: '100%' }} numberOfLines={1} ellipsizeMode="tail">{block.title}</Text>
              <Text style={{ color: '#E11D48', fontSize: 14 }}>See All</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'row', paddingLeft: 20, paddingRight: 24 }}
            >
              {block.subjects.map((sub, index) => (
                <View key={`${sub.subjectId}-${index}`} style={{ marginRight: 24 }}>
                  <PosterCard
                    item={sub}
                    onPress={() => goItem(sub)}
                    width={120}
                    containerStyle={{ marginRight: 0, marginBottom: 0 }}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* Header overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'rgba(9, 9, 11, 0.5)',
          paddingTop: insets.top,
          paddingBottom: 12,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#fafafa',
              letterSpacing: 2,
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            Heemovie
          </Text>
          <Pressable
            onPress={goSearch}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(24, 24, 27, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            })}
          >
            <Search size={22} color="#fafafa" strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
