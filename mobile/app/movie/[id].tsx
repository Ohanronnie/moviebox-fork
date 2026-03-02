import { View, ScrollView, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Download, Plus, ChevronLeft, Star, Clock, Calendar } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const { width } = Dimensions.get('window');

const ALL_MOVIES = [
  { 
    id: '1', 
    title: 'The Avengers', 
    year: '2012', 
    rating: '8.0', 
    duration: '2h 23m',
    genres: ['Action', 'Sci-Fi'],
    image: require('@/assets/images/posters/avengers.jpg'),
    description: 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are to stop the mischievous Loki and his alien army from enslaving humanity.'
  },
  { 
    id: '2', 
    title: 'Spider-Man', 
    year: '2002', 
    rating: '7.4', 
    duration: '2h 1m',
    genres: ['Action', 'Adventure'],
    image: require('@/assets/images/posters/spiderman.jpg'),
    description: 'When bitten by a genetically modified spider, a nerdy, shy, and awkward high school student gains spider-like abilities that he eventually must use to fight evil as a superhero after tragedy befalls his family.'
  },
  { 
    id: '3', 
    title: 'Bullet Train', 
    year: '2022', 
    rating: '7.3', 
    duration: '2h 6m',
    genres: ['Action', 'Comedy', 'Thriller'],
    image: require('@/assets/images/posters/bullet_train.jpg'),
    description: 'Five assassins aboard a swiftly-moving bullet train find out their missions have something in common.'
  },
  { 
    id: '4', 
    title: 'Batman', 
    year: '2022', 
    rating: '7.8', 
    duration: '2h 56m',
    genres: ['Action', 'Crime', 'Drama'],
    image: require('@/assets/images/posters/batman.jpg'),
    description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.'
  },
  { 
    id: '5', 
    title: 'Dune', 
    year: '2021', 
    rating: '8.0', 
    duration: '2h 35m',
    genres: ['Action', 'Adventure', 'Drama'],
    image: require('@/assets/images/posters/dune.jpg'),
    description: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions of a dark future.'
  },
  { 
    id: '6', 
    title: 'Sonic', 
    year: '2020', 
    rating: '6.5', 
    duration: '1h 39m',
    genres: ['Action', 'Adventure', 'Comedy'],
    image: require('@/assets/images/posters/sonic.jpg'),
    description: 'After discovering a small, blue, fast-as-lightning hedgehog, a small-town police officer must help him defeat an evil genius who wants to do experiments on him.'
  },
];

export default function MovieDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const movie = ALL_MOVIES.find(m => m.id === id) ?? ALL_MOVIES[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}>
        {/* Poster & Backdrop */}
        <View style={styles.backdropContainer}>
          <Image
            source={movie.image}
            style={styles.backdrop}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Typography variant="h1" style={styles.title}>{movie.title}</Typography>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" style={{ marginRight: 4 }} />
              <Typography variant="p" weight="bold">{movie.rating}</Typography>
            </View>
            <View style={styles.metaSeparator} />
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.mutedForeground} style={{ marginRight: 4 }} />
              <Typography variant="p" style={{ color: colors.mutedForeground }}>{movie.duration}</Typography>
            </View>
            <View style={styles.metaSeparator} />
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.mutedForeground} style={{ marginRight: 4 }} />
              <Typography variant="p" style={{ color: colors.mutedForeground }}>{movie.year}</Typography>
            </View>
          </View>

          <View style={styles.genreRow}>
            {movie.genres.map(genre => (
              <View key={genre} style={[styles.genreBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Typography variant="small" style={{ color: colors.mutedForeground }}>{genre}</Typography>
              </View>
            ))}
          </View>

          <Typography variant="p" style={[styles.description, { color: colors.mutedForeground }]}>
            {movie.description}
          </Typography>

          <View style={styles.mainActions}>
            <Button 
              label="Watch Now" 
              icon={<Play size={20} color="#fff" fill="#fff" />}
              size="lg"
              style={{ flex: 1 }}
            />
            <Button 
              label="Download" 
              variant="outline"
              icon={<Download size={20} color={colors.foreground} />}
              size="lg"
              style={{ marginLeft: spacing.md }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Header buttons outside ScrollView so touches work */}
      <SafeAreaView style={styles.headerActions}>
        <View style={styles.headerActionsInner}>
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdropContainer: {
    height: 450,
    width: '100%',
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerActionsInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  title: {
    fontSize: 32,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3f3f46',
    marginHorizontal: 12,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  description: {
    lineHeight: 24,
    fontSize: 16,
    marginBottom: 32,
  },
  mainActions: {
    flexDirection: 'row',
  }
});
