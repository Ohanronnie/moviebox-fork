import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Film, Tv, Monitor, Sparkles, X } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

import { useTrending, useSearch } from '@/lib/hooks';
import { PosterCard } from '@/components/PosterCard';
import { getDetailParams } from '@/lib/utils';
import type { TrendingItem } from '@/lib/types';

const { width } = Dimensions.get('window');
const GAP = 16;
const cardWidth = (width - 48 - GAP) / 2;

const CATEGORIES = [
  { name: 'Movies', icon: Film, color: '#E11D48' },
  { name: 'TV Shows', icon: Tv, color: '#3B82F6' },
  { name: 'Documentaries', icon: Monitor, color: '#10B981' },
  { name: 'Animation', icon: Sparkles, color: '#F59E0B' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: trendingData, isLoading: trendingLoading } = useTrending(0, 24);
  const { data: searchData, isLoading: searchLoading } = useSearch(query, { enabled: isSearching && query.length > 0 });

  const items: TrendingItem[] = isSearching && query.length > 0
    ? searchData?.items ?? []
    : trendingData?.items ?? [];

  const goItem = (item: TrendingItem) => {
    const { detailPath, subjectId } = getDetailParams(item);
    if (!detailPath && !subjectId) return;
    router.push({
      pathname: '/movie/[id]',
      params: { id: subjectId, detailPath, subjectId, isSeries: item.subjectType === 2 ? '1' : '0' },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100, padding: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fafafa' }}>Explore</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', borderRadius: 12, borderWidth: 1, borderColor: '#27272a', paddingHorizontal: 16, height: 48 }}>
              <Search size={20} color="#71717a" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Movies, actors..."
                placeholderTextColor="#71717a"
                value={query}
                onChangeText={setQuery}
                onFocus={() => setIsSearching(true)}
                style={{ flex: 1, fontSize: 16, color: '#fafafa', height: '100%' }}
              />
              {query.length > 0 && (
                <Pressable onPress={() => { setQuery(''); setIsSearching(false); }} hitSlop={12}>
                  <X size={20} color="#71717a" />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => query.length > 0 && setIsSearching(true)}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, backgroundColor: '#E11D48', paddingHorizontal: 16, height: 48, borderRadius: 12, justifyContent: 'center' })}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Search</Text>
            </Pressable>
          </View>

          {(isSearching && query.length > 0 ? searchLoading : trendingLoading) ? (
            <View style={{ marginTop: 32, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E11D48" />
            </View>
          ) : isSearching && query.length > 0 ? (
            <View style={{ marginTop: 28, marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fafafa', marginBottom: 16 }}>
                {items.length} {items.length === 1 ? 'Result' : 'Results'} Found
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {items.map((item, index) => (
                  <View
                    key={`${item.subjectId}-${index}`}
                    style={{
                      width: cardWidth,
                      marginRight: index % 2 === 0 ? GAP : 0,
                      marginBottom: 20,
                    }}
                  >
                    <PosterCard
                      item={item}
                      width={cardWidth}
                      containerStyle={{ marginRight: 0, marginBottom: 0 }}
                      onPress={() => goItem(item)}
                    />
                  </View>
                ))}
              </View>
              {items.length === 0 && (
                <Text style={{ color: '#71717a', marginTop: 40, textAlign: 'center' }}>Nothing matching your search...</Text>
              )}
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fafafa', marginTop: 28, marginBottom: 16 }}>Categories</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.name}
                    style={{ width: '50%', padding: 8 }}
                    onPress={() => { setQuery(cat.name); setIsSearching(true); }}
                  >
                    <View style={{ height: 100, backgroundColor: '#18181b', borderRadius: 8, borderWidth: 1, borderColor: '#27272a', alignItems: 'center', justifyContent: 'center' }}>
                      <cat.icon size={24} color={cat.color} />
                      <Text style={{ marginTop: 8, color: '#fafafa', fontWeight: '600' }}>{cat.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fafafa', marginTop: 28, marginBottom: 16 }}>Popular Genres</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'].map((genre) => (
                  <Pressable
                    key={genre}
                    onPress={() => { setQuery(genre); setIsSearching(true); }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: '#18181b',
                      borderWidth: 1,
                      borderColor: '#27272a',
                      borderRadius: 9999,
                    })}
                  >
                    <Text style={{ color: '#fafafa', fontSize: 14 }}>{genre}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
