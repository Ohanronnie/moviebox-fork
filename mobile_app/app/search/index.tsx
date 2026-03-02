import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronLeft, X } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

import { useSearch, usePopularSearches } from '@/lib/hooks';
import { PosterCard } from '@/components/PosterCard';
import { getDetailParams } from '@/lib/utils';

const { width } = Dimensions.get('window');
const GAP = 16;
const cardWidth = (width - 48 - GAP) / 2;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data: popularSearches } = usePopularSearches();
  const { data: searchData, isLoading: searchLoading } = useSearch(query, { enabled: query.length > 0 });

  const items = searchData?.items ?? [];

  const goItem = (item: { subjectId: string; subjectType: number; detailPath?: string; url?: string }) => {
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
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            })}
          >
            <ChevronLeft size={24} color="#fafafa" />
          </Pressable>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', borderRadius: 22, paddingHorizontal: 16, height: 44 }}>
            <Search size={20} color="#71717a" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search movies, actors..."
              placeholderTextColor="#71717a"
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={{ flex: 1, fontSize: 16, color: '#fafafa', paddingVertical: 8 }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={12}>
                <X size={20} color="#71717a" style={{ marginLeft: 8 }} />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
          {query.length === 0 ? (
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fafafa', marginBottom: 16 }}>Popular Searches</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(popularSearches ?? []).map((item) => (
                  <Pressable
                    key={item.title}
                    onPress={() => setQuery(item.title)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: '#18181b',
                      borderRadius: 8,
                    })}
                  >
                    <Text style={{ color: '#fafafa', fontSize: 14 }}>{item.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : searchLoading ? (
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E11D48" />
            </View>
          ) : (
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fafafa', marginBottom: 16, maxWidth: '100%' }} numberOfLines={1} ellipsizeMode="tail">Results for "{query}"</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
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
                <Text style={{ color: '#71717a', marginTop: 40, textAlign: 'center' }}>No movies found matching your search.</Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
