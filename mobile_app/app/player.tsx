import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { readDownloads } from '@/lib/downloads';

function VideoPlayerContent({ fileUri, title }: { fileUri: string; title: string }) {
  const router = useRouter();
  const player = useVideoPlayer(fileUri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={StyleSheet.absoluteFill} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={12}>
            <ChevronLeft size={28} color="#fff" />
          </Pressable>
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        </View>
      </SafeAreaView>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={true}
      />
    </View>
  );
}

export default function PlayerScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];

  const [fileUri, setFileUri] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        if (!cancelled) setError('Missing video');
        return;
      }
      try {
        const list = await readDownloads();
        const entry = list.find((e) => e.id === id);
        if (cancelled) return;
        if (!entry) {
          setError('Download not found');
          return;
        }
        setFileUri(entry.filePath);
        setTitle(entry.title);
      } catch (e) {
        if (!cancelled) setError((e as Error)?.message ?? 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E11D48" />
        <Text style={styles.subtitle}>Loading video…</Text>
      </View>
    );
  }

  if (error || !fileUri) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? 'Video not found'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return <VideoPlayerContent fileUri={fileUri} title={title} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  video: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  headerBtn: {
    marginRight: 12,
    padding: 4,
  },
  titleText: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    color: '#71717a',
    marginTop: 12,
  },
  error: {
    color: '#f87171',
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#27272a',
    borderRadius: 12,
  },
  backBtnText: {
    color: '#fafafa',
    fontWeight: '600',
  },
});
