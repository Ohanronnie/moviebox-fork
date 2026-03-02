import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Trash2, Download } from 'lucide-react-native';

import { useActiveDownloads } from '@/lib/ActiveDownloadsContext';
import { readDownloads, removeDownload, type DownloadEntry } from '@/lib/downloads';

function formatSubtitle(entry: DownloadEntry): string {
  if (entry.isSeries && entry.season != null && entry.episode != null) {
    return `Season ${entry.season} · Episode ${entry.episode}`;
  }
  return 'Movie';
}

export default function DownloadsScreen() {
  const router = useRouter();
  const [list, setList] = useState<DownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeDownloads } = useActiveDownloads();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await readDownloads();
      setList(entries);
    } catch (_) {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handlePlay = (entry: DownloadEntry) => {
    router.push({ pathname: '/player', params: { id: entry.id } });
  };

  const handleRemove = (entry: DownloadEntry) => {
    Alert.alert(
      'Remove download',
      `Remove "${entry.title}" from downloads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeDownload(entry.id);
            load();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Download size={28} color="#fafafa" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fafafa' }}>Downloads</Text>
          </View>

          {/* In-progress downloads */}
          {activeDownloads.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#a1a1aa', marginBottom: 12 }}>
                Downloading…
              </Text>
              {activeDownloads.map((item) => {
                const totalBytes = item.totalBytes;
                const totalMB = totalBytes ? totalBytes / (1024 * 1024) : null;
                const downloadedMB =
                  totalMB != null && totalBytes
                    ? (item.progress * totalBytes) / (1024 * 1024)
                    : null;
                return (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: '#18181b',
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: '#27272a',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <ActivityIndicator size="small" color="#E11D48" style={{ marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fafafa', fontWeight: '600', fontSize: 15 }} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={{ color: '#71717a', fontSize: 13, marginTop: 2 }}>{item.subtitle}</Text>
                      </View>
                      <Text style={{ color: '#E11D48', fontWeight: '700', fontSize: 14 }}>
                        {item.progress > 0 ? `${Math.round(item.progress * 100)}%` : '…'}
                      </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: '#27272a', borderRadius: 3, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${Math.max(2, Math.round(item.progress * 100))}%`,
                          backgroundColor: '#E11D48',
                          borderRadius: 3,
                        }}
                      />
                    </View>
                    {totalMB != null && downloadedMB != null && (
                      <Text style={{ color: '#a1a1aa', fontSize: 12, marginTop: 6 }}>
                        {`${downloadedMB.toFixed(1)} MB / ${totalMB.toFixed(1)} MB`}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Completed downloads */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fafafa', marginBottom: 12 }}>
            {activeDownloads.length > 0 ? 'Completed' : 'Downloads'}
          </Text>

          {loading ? (
            <Text style={{ color: '#71717a', textAlign: 'center', marginTop: 20 }}>Loading...</Text>
          ) : list.length === 0 && activeDownloads.length === 0 ? (
            <Text style={{ color: '#71717a', textAlign: 'center', marginTop: 20 }}>
              No downloads yet. Download from a title's detail page.
            </Text>
          ) : list.length === 0 ? (
            <Text style={{ color: '#71717a', textAlign: 'center', marginTop: 20 }}>
              No completed downloads yet.
            </Text>
          ) : (
            list.map((entry) => (
              <View
                key={entry.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#18181b',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#27272a',
                }}
              >
                {entry.coverUrl ? (
                  <Image
                    source={{ uri: entry.coverUrl }}
                    style={{ width: 72, height: 108, borderRadius: 8, backgroundColor: '#27272a' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 72,
                      height: 108,
                      borderRadius: 8,
                      backgroundColor: '#27272a',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play size={28} color="#71717a" />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{ color: '#fafafa', fontWeight: '600', fontSize: 16 }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {entry.title}
                  </Text>
                  <Text style={{ color: '#71717a', fontSize: 13, marginTop: 4 }}>
                    {formatSubtitle(entry)}
                  </Text>
                  {entry.size != null && entry.size > 0 && (
                    <Text style={{ color: '#a1a1aa', fontSize: 12, marginTop: 4 }}>
                      {`${(entry.size / (1024 * 1024)).toFixed(1)} MB`}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => handlePlay(entry)}
                  style={({ pressed }) => ({
                    padding: 12,
                    opacity: pressed ? 0.8 : 1,
                    marginRight: 8,
                  })}
                >
                  <Play size={24} color="#E11D48" fill="#E11D48" />
                </Pressable>
                <Pressable
                  onPress={() => handleRemove(entry)}
                  style={({ pressed }) => ({
                    padding: 12,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Trash2 size={22} color="#71717a" />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
