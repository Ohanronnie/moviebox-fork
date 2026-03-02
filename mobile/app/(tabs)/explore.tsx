import { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { MovieCard } from '@/components/MovieCard';
import { Search, Film, Tv, Monitor, Sparkles, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { name: 'Movies', icon: Film, color: '#E11D48' },
  { name: 'TV Shows', icon: Tv, color: '#3B82F6' },
  { name: 'Documentaries', icon: Monitor, color: '#10B981' },
  { name: 'Animation', icon: Sparkles, color: '#F59E0B' },
];

const ALL_MOVIES = [
  { id: '1', title: 'The Avengers', year: '2012', rating: '8.0', image: require('@/assets/images/posters/avengers.jpg') },
  { id: '2', title: 'Spider-Man', year: '2002', rating: '7.4', image: require('@/assets/images/posters/spiderman.jpg') },
  { id: '3', title: 'Bullet Train', year: '2022', rating: '7.3', image: require('@/assets/images/posters/bullet_train.jpg') },
  { id: '4', title: 'Batman', year: '2022', rating: '7.8', image: require('@/assets/images/posters/batman.jpg') },
  { id: '5', title: 'Dune', year: '2021', rating: '8.0', image: require('@/assets/images/posters/dune.jpg') },
  { id: '6', title: 'Sonic', year: '2020', rating: '6.5', image: require('@/assets/images/posters/sonic.jpg') },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredMovies = ALL_MOVIES.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearch = () => {
    if (query.length > 0) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsSearching(false);
  };

  const navigateToMovie = (id: string) => {
    router.push({
      pathname: '/movie/[id]',
      params: { id }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={{ padding: spacing.lg }}>
            <Typography variant="h1" weight="bold">Explore</Typography>
            
            {/* Search Bar Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm }}>
              <View style={[styles.searchBar, { 
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderColor: colors.border,
                borderWidth: 1,
                flex: 1
              }]}>
                <Search size={20} color={colors.mutedForeground} style={{ marginRight: spacing.sm }} />
                <TextInput
                  placeholder="Movies, actors..."
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground }]}
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => setIsSearching(true)}
                  onSubmitEditing={handleSearch}
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                    onPress={handleClear}
                  >
                    <X size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              </View>
              <Button 
                label="Search" 
                size="md" 
                onPress={handleSearch}
                style={{ height: 50, paddingHorizontal: 16 }}
              />
            </View>

            {isSearching ? (
              <View style={{ marginTop: spacing.xl }}>
                <Typography variant="h3" style={{ marginBottom: spacing.md }}>
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'Result' : 'Results'} Found
                </Typography>
                <View style={styles.resultsGrid}>
                  {filteredMovies.map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      {...movie} 
                      width={(width - spacing.lg * 2 - spacing.md) / 2}
                      onPress={() => navigateToMovie(movie.id)}
                    />
                  ))}
                </View>
                {filteredMovies.length === 0 && (
                  <View style={{ marginTop: 40, alignItems: 'center' }}>
                    <Typography variant="p" style={{ color: colors.mutedForeground }}>
                      Nothing matching your search...
                    </Typography>
                  </View>
                )}
              </View>
            ) : (
              <>
                {/* Genre Grid */}
                <Typography variant="h3" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
                  Categories
                </Typography>
                
                <View style={styles.grid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      activeOpacity={0.7}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      style={styles.gridItem}
                    >
                      <Card style={[styles.categoryCard, { borderColor: colors.border }]} variant="outline">
                        <cat.icon size={24} color={cat.color} />
                        <Typography variant="p" weight="semibold" style={{ marginTop: spacing.sm }}>
                          {cat.name}
                        </Typography>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Popular Genres */}
                <Typography variant="h3" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
                  Popular Genres
                </Typography>
                <View style={[styles.tagContainer]}>
                  {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'].map((genre) => (
                    <TouchableOpacity
                      key={genre}
                      activeOpacity={0.7}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      onPress={() => {
                        setQuery(genre);
                        setIsSearching(true);
                      }}
                      style={[styles.tag, {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderWidth: 1,
                        borderRadius: radius.full
                      }]}
                    >
                      <Typography variant="small">{genre}</Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  categoryCard: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagContainer: {
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
  }
});
