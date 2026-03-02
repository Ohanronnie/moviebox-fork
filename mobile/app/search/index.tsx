import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronLeft, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/components/ui/Typography';
import { MovieCard } from '@/components/MovieCard';

const { width } = Dimensions.get('window');

const ALL_MOVIES = [
  { id: '1', title: 'The Avengers', year: '2012', rating: '8.0', image: require('@/assets/images/posters/avengers.jpg') },
  { id: '2', title: 'Spider-Man', year: '2002', rating: '7.4', image: require('@/assets/images/posters/spiderman.jpg') },
  { id: '3', title: 'Bullet Train', year: '2022', rating: '7.3', image: require('@/assets/images/posters/bullet_train.jpg') },
  { id: '4', title: 'Batman', year: '2022', rating: '7.8', image: require('@/assets/images/posters/batman.jpg') },
  { id: '5', title: 'Dune', year: '2021', rating: '8.0', image: require('@/assets/images/posters/dune.jpg') },
  { id: '6', title: 'Sonic', year: '2020', rating: '6.5', image: require('@/assets/images/posters/sonic.jpg') },
];

export default function SearchScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const [query, setQuery] = useState('');

  const filteredMovies = ALL_MOVIES.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>

        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderRadius: radius.full }]}>
          <Search size={20} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            placeholder="Search movies, actors..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
              onPress={() => setQuery('')}
            >
              <X size={20} color={colors.mutedForeground} style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {query.length === 0 ? (
          <View>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>Popular Searches</Typography>
            <View style={styles.tagsContainer}>
              {['Action', 'Comedy', 'Sci-Fi', 'Thriller', 'Marvel', 'DC'].map(tag => (
                <TouchableOpacity
                  key={tag}
                  activeOpacity={0.7}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  style={[styles.tag, { backgroundColor: colors.card, borderRadius: radius.md }]}
                  onPress={() => setQuery(tag)}
                >
                  <Typography variant="small">{tag}</Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Results for "{query}"
            </Typography>
            <View style={styles.resultsGrid}>
              {false && filteredMovies.map(movie => (
                <MovieCard 
                  key={movie.id} 
                  {...movie} 
                  width={(width - spacing.lg * 2 - spacing.md) / 2}
                  onPress={() => router.push({
                    pathname: '/movie/[id]',
                    params: { id: movie.id }
                  })}
                />
              ))}
            </View>
            {filteredMovies.length === 0 && (
              <View style={styles.emptyState}>
                <Typography variant="p" style={{ color: colors.mutedForeground }}>
                  No movies found matching your search.
                </Typography>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearIcon: {
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    paddingTop: 40,
    alignItems: 'center',
  }
});
