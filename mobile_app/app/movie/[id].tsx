import { useState } from 'react';
import { View, ScrollView, Text, Pressable, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
// Removed @react-native-picker/picker as it was reported as not working.
// Using custom horizontal chips for better reliability and UX.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Download, Plus, ChevronLeft, Star, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDetails, useRecommendations } from '@/lib/hooks';
import { api } from '@/lib/api';
import type { MediaInfoResponse } from '@/lib/types';
import { downloadToStorage, getDownloadId } from '@/lib/downloads';
import { useActiveDownloads } from '@/lib/ActiveDownloadsContext';
import { PosterCard } from '@/components/PosterCard';
import { BACKDROP_HEIGHT, POSTER_WIDTH_SM } from '@/constants/images';
import { capitalizeTitle } from '@/lib/utils';

const DETAIL_PATH = '/detail';

export default function MovieDetailScreen() {
  const params = useLocalSearchParams<{ url?: string; detailPath?: string; subjectId?: string; isSeries?: string }>();
  const paramUrl = Array.isArray(params.url) ? params.url[0] : params.url ?? '';
  const detailPath = Array.isArray(params.detailPath) ? params.detailPath[0] : params.detailPath ?? '';
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId ?? '';
  const isSeries = (Array.isArray(params.isSeries) ? params.isSeries[0] : params.isSeries) === '1';

  const url = detailPath && subjectId ? `${DETAIL_PATH}/${detailPath}?id=${subjectId}` : paramUrl;

  const router = useRouter();

  const { data: detailsData, isLoading: detailsLoading, isError: detailsError } = useDetails(url, isSeries, !!url);
  const { data: recData } = useRecommendations(url, isSeries, 1, !!url);
  const subject = detailsData?.resData?.subject;
  const recommendations = recData?.items ?? [];
  const seasons = detailsData?.resData?.resource?.seasons ?? [];

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotalBytes, setDownloadTotalBytes] = useState<number | null>(null);
  const { addActive, updateProgress, removeActive } = useActiveDownloads();

  const currentSeason =
    seasons.find((s) => s.se === selectedSeason) ?? seasons[0];

  const goItem = (itemDetailPath: string, itemSubjectId: string, itemIsSeries: boolean) =>
    router.push({
      pathname: '/movie/[id]',
      params: { id: itemSubjectId, detailPath: itemDetailPath, subjectId: itemSubjectId, isSeries: itemIsSeries ? '1' : '0' },
    });

  const handlePlay = async () => {
    try {
      const season = isSeries ? selectedSeason : 1;
      const episode = isSeries ? selectedEpisode : 1;
      const { data } = await api.get<MediaInfoResponse>('/media-info', {
        params: { url, is_series: isSeries, season, episode },
      });
      if (data.downloads?.length) {
        const best = data.downloads.reduce((a, b) =>
          (b.resolution ?? 0) > (a.resolution ?? 0) ? b : a
        );
        await Linking.openURL(best.url);
      } else {
        Alert.alert('Not available', 'No stream available for this title.');
      }
    } catch (e) {
      Alert.alert('Error', (e as Error)?.message ?? 'Could not open stream.');
    }
  };

  const handleDownload = async () => {
    if (!subject || !detailPath || !subjectId) return;
    const season = isSeries ? selectedSeason : 1;
    const episode = isSeries ? selectedEpisode : 1;
    const downloadId = getDownloadId({ subjectId, isSeries, season, episode });
    const title = subject.title ?? 'Unknown';
    const subtitle = isSeries ? `Season ${season} · Episode ${episode}` : 'Movie';

    console.log('[download] handleDownload', {
      url,
      isSeries,
      season,
      episode,
      subjectId,
      detailPath,
    });

    setDownloading(true);
    setDownloadProgress(0);
    setDownloadTotalBytes(null);
    try {
      const { data } = await api.get<MediaInfoResponse>('/media-info', {
        params: { url, is_series: isSeries, season, episode },
      });
      if (!data.downloads?.length) {
        setDownloading(false);
        removeActive(downloadId);
        Alert.alert('No download', 'No download available for this title.');
        return;
      }
      const best = data.downloads.reduce((a, b) =>
        (b.resolution ?? 0) > (a.resolution ?? 0) ? b : a
      );
      const totalBytes = best.size ?? 0;
      setDownloadTotalBytes(totalBytes || null);
      addActive(downloadId, title, subtitle, totalBytes || undefined);
      await downloadToStorage(
        {
          rawMediaUrl: best.url,
          subjectId,
          detailPath,
          title,
          isSeries,
          season: isSeries ? season : undefined,
          episode: isSeries ? episode : undefined,
          resolution: best.resolution,
          size: best.size,
          coverUrl: imageUrl ?? undefined,
        },
        (p) => {
          setDownloadProgress(p);
          updateProgress(downloadId, p);
        }
      );
      setDownloading(false);
      setDownloadProgress(0);
      setDownloadTotalBytes(null);
      removeActive(downloadId);
      Alert.alert(
        'Downloaded',
        'Saved to app storage. Open the Downloads tab to play.',
        [{ text: 'OK' }, { text: 'Go to Downloads', onPress: () => router.replace('/(tabs)/downloads') }]
      );
    } catch (e) {
      setDownloading(false);
      setDownloadProgress(0);
      setDownloadTotalBytes(null);
      removeActive(downloadId);
      Alert.alert('Download failed', (e as Error)?.message ?? 'Could not download.');
    }
  };

  const imageUrl = subject?.cover?.url ?? subject?.image?.url;
  const genres = Array.isArray(subject?.genre) ? subject.genre : subject?.genre ? [subject.genre] : [];
  const year = subject?.releaseDate?.slice(0, 4) ?? '';

  if (!url) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#71717a', textAlign: 'center' }}>Missing item</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#E11D48' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (detailsLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  if (detailsError || !subject) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#a1a1aa', textAlign: 'center' }}>Could not load this title.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#E11D48' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ height: BACKDROP_HEIGHT, width: '100%', position: 'relative' }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: BACKDROP_HEIGHT }}
              contentFit="cover"
            />
          ) : (
            <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: BACKDROP_HEIGHT, backgroundColor: '#18181b' }} />
          )}
          <LinearGradient colors={['transparent', '#09090b']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: -40, width: '100%' }}>
          <Text style={{ color: '#fafafa', fontSize: 28, fontWeight: 'bold', marginBottom: 16, maxWidth: '100%' }} numberOfLines={2} ellipsizeMode="tail">{capitalizeTitle(subject.title)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            {subject.imdbRatingValue != null && (
              <>
                <Star size={16} color="#fbbf24" fill="#fbbf24" style={{ marginRight: 4 }} />
                <Text style={{ color: '#fafafa', fontWeight: 'bold', marginRight: 12 }}>{subject.imdbRatingValue}</Text>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#3f3f46', marginRight: 12 }} />
              </>
            )}
            <Calendar size={16} color="#a1a1aa" style={{ marginRight: 4 }} />
            <Text style={{ color: '#a1a1aa', marginRight: 12 }}>{year}</Text>
          </View>
          {genres.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {genres.map((g) => (
                <View key={String(g)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#27272a', backgroundColor: '#18181b' }}>
                  <Text style={{ color: '#a1a1aa', fontSize: 14 }}>{g}</Text>
                </View>
              ))}
            </View>
          )}
          {subject.description ? (
            <Text style={{ color: '#a1a1aa', lineHeight: 24, fontSize: 16, marginBottom: 28, maxWidth: '100%' }} numberOfLines={5} ellipsizeMode="tail">{subject.description}</Text>
          ) : null}

          {isSeries && seasons.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#fafafa', marginBottom: 12 }}>Seasons & Episodes</Text>

              {/* Season Chips (Custom Picker) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
                style={{ marginBottom: 16 }}
              >
                {seasons.map((season) => {
                  const isSelected = selectedSeason === season.se;
                  return (
                    <Pressable
                      key={season.se}
                      onPress={() => {
                        setSelectedSeason(season.se);
                        setSelectedEpisode(1);
                      }}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: isSelected ? '#E11D48' : '#18181b',
                        borderWidth: 1,
                        borderColor: isSelected ? '#E11D48' : '#27272a',
                        minWidth: 100,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? '#fff' : '#fafafa',
                          fontWeight: 'bold',
                          fontSize: 14,
                        }}
                      >
                        Season {season.se}
                      </Text>
                      <Text
                        style={{
                          color: isSelected ? 'rgba(255,255,255,0.7)' : '#71717a',
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {season.maxEp} {season.maxEp === 1 ? 'EP' : 'EPS'}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Episodes for selected season */}
              {currentSeason && (
                <>
                  <Text style={{ color: '#a1a1aa', fontSize: 15, marginTop: 8, marginBottom: 8 }}>
                    Episodes · Season {currentSeason.se}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                    {Array.from({ length: currentSeason.maxEp }, (_, i) => i + 1).map((ep) => {
                      const isSelected =
                        selectedSeason === currentSeason.se && selectedEpisode === ep;
                      return (
                        <Pressable
                          key={ep}
                          onPress={() => {
                            setSelectedSeason(currentSeason.se);
                            setSelectedEpisode(ep);
                          }}
                          style={{
                            width: 40,
                            height: 40,
                            marginRight: 8,
                            marginBottom: 8,
                            borderRadius: 8,
                            backgroundColor: isSelected ? '#E11D48' : '#27272a',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#fafafa', fontWeight: '600', fontSize: 14 }}>
                            {ep}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={{ color: '#71717a', fontSize: 14, marginTop: 4 }}>
                Selected: Season {selectedSeason}, Episode {selectedEpisode}
              </Text>
            </View>
          )}

          {isSeries && seasons.length > 0 && (
            <Text style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 8 }}>
              Watch / download: S{selectedSeason} E{selectedEpisode}
            </Text>
          )}
          <View style={{ flexDirection: 'row', marginBottom: 32, marginTop: 4, alignItems: 'stretch' }}>
            <Pressable
              onPress={handlePlay}
              style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.88 : 1 })}
            >
              <View
                style={{
                  backgroundColor: '#E11D48',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Play size={20} color="#fff" fill="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Watch Now</Text>
              </View>
            </Pressable>
            <View style={{ width: 12 }} />
            <Pressable
              onPress={handleDownload}
              disabled={downloading}
              style={({ pressed }) => ({ flex: 1, opacity: downloading ? 0.7 : pressed ? 0.88 : 1 })}
            >
              <View
                style={{
                  backgroundColor: '#27272a',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  elevation: 1,
                }}
              >
                {downloading ? (
                  <>
                    <ActivityIndicator size="small" color="#fafafa" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fafafa', fontWeight: '600', fontSize: 15 }}>
                      {downloadProgress > 0 ? `${Math.round(downloadProgress * 100)}%` : 'Downloading…'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Download size={20} color="#fafafa" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fafafa', fontWeight: '600', fontSize: 15 }}>Download</Text>
                  </>
                )}
              </View>
            </Pressable>
          </View>

          {downloading && (
            <View style={{ marginTop: 8, marginBottom: 24 }}>
              <View style={{ height: 6, backgroundColor: '#27272a', borderRadius: 3, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${Math.max(2, Math.round(downloadProgress * 100))}%`,
                    backgroundColor: '#E11D48',
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={{ color: '#71717a', fontSize: 12, marginTop: 6 }}>
                Downloading to app storage… You can switch to the Downloads tab to see progress.
              </Text>
              {downloadTotalBytes != null && downloadTotalBytes > 0 && (
                <Text style={{ color: '#a1a1aa', fontSize: 12, marginTop: 4 }}>
                  {`${((downloadProgress * downloadTotalBytes) / (1024 * 1024)).toFixed(1)} MB / ${(downloadTotalBytes / (1024 * 1024)).toFixed(1)} MB`}
                </Text>
              )}
            </View>
          )}

          {recommendations.length > 0 && (
            <View style={{ marginTop: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fafafa', marginBottom: 20 }}>More like this</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: 'row',
                  paddingRight: 28,
                }}
              >
                {recommendations.map((item, index) => (
                  <View key={`${item.subjectId}-${index}`} style={{ marginRight: 28 }}>
                    <PosterCard
                      item={item}
                      width={POSTER_WIDTH_SM}
                      containerStyle={{ marginRight: 0, marginBottom: 0 }}
                      onPress={() => goItem(item.detailPath ?? '', item.subjectId, item.subjectType === 2)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Plus size={24} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
