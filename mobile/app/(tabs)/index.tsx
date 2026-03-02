import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Download, Plus, Search } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { MovieCard } from '@/components/MovieCard';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const TRENDING = [
  { id: '1', title: 'The Avengers', year: '2012', rating: '8.0', image: require('@/assets/images/posters/avengers.jpg') },
  { id: '2', title: 'Spider-Man', year: '2002', rating: '7.4', image: require('@/assets/images/posters/spiderman.jpg') },
  { id: '3', title: 'Bullet Train', year: '2022', rating: '7.3', image: require('@/assets/images/posters/bullet_train.jpg') },
  { id: '4', title: 'Batman', year: '2022', rating: '7.8', image: require('@/assets/images/posters/batman.jpg') },
];

const NEW_RELEASES = [
  { id: '5', title: 'Dune', year: '2021', rating: '8.0', image: require('@/assets/images/posters/dune.jpg') },
  { id: '6', title: 'Sonic', year: '2020', rating: '6.5', image: require('@/assets/images/posters/sonic.jpg') },
];

export default function HomeScreen() {
  const { colors, globalColors, spacing, radius } = useTheme();
  const router = useRouter();

  const navigateToMovie = (id: string) => {
    router.push({
      pathname: '/movie/[id]',
      params: { id }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/posters/bullet_train.jpg')}
            style={styles.heroImage}
            contentFit="cover"
          />
          <BlurView intensity={20} style={styles.heroOverlay}>
            <View style={[styles.heroContent, { padding: spacing.lg }]}>
              <Typography variant="h1" style={styles.heroTitle}>Bullet Train</Typography>
              <Typography variant="p" style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
                Action • Comedy • Thriller • 2022
              </Typography>
              
              <View style={styles.heroActions}>
                <Button 
                  label="Play Now" 
                  icon={<Play size={18} color="#fff" fill="#fff" />} 
                  style={{ flex: 1 }}
                  onPress={() => navigateToMovie('3')}
                />
                <Button 
                  label="Download" 
                  variant="outline"
                  icon={<Download size={18} color={colors.foreground} />} 
                  style={{ marginLeft: spacing.md }}
                />
              </View>
            </View>
          </BlurView>
        </View>

        {/* Section: Trending */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3">Trending Now</Typography>
            <Typography variant="small" style={{ color: globalColors.primary }}>See All</Typography>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: spacing.lg }}>
            {TRENDING.map(movie => (
              <MovieCard key={movie.id} {...movie} onPress={() => navigateToMovie(movie.id)} />
            ))}
          </ScrollView>
        </View>

        {/* Section: New Releases */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3">New Releases</Typography>
            <Typography variant="small" style={{ color: globalColors.primary }}>See All</Typography>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: spacing.lg }}>
            {NEW_RELEASES.map(movie => (
              <MovieCard key={movie.id} {...movie} onPress={() => navigateToMovie(movie.id)} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Header Search Button - header must capture touches so the button works (no box-none) */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerInner}>
          <Typography variant="h2" weight="bold" style={{ color: globalColors.primary }}>MovieBox</Typography>
          <TouchableOpacity
            
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.searchButton, { backgroundColor: colors.card }]}
            onPress={() => {
              console.log('[MovieBox] Search icon pressed');
              router.push('/search');
            }}
          >
            <Search size={22} color={colors.foreground} />
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    height: 550,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    paddingBottom: 40,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 42,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#ccc',
    marginBottom: 24,
  },
  heroActions: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
});
