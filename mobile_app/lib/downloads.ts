/**
 * Download storage and metadata.
 * Uses expo-file-system/legacy for createDownloadResumable (progress) until we migrate to the new File/Directory API.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL } from './api';

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}downloads`;
const META_PATH = `${DOWNLOADS_DIR}/metadata.json`;

// Headers required by the upstream provider when hitting them directly.
const PROVIDER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0',
  Referer: 'https://fmoviesunblocked.net/',
  Origin: 'https://h5.aoneroom.com',
  Accept: '*/*',
};

export interface DownloadEntry {
  id: string;
  subjectId: string;
  detailPath: string;
  title: string;
  isSeries: boolean;
  season?: number;
  episode?: number;
  filePath: string;
  resolution?: number;
  size?: number;
  downloadedAt: string;
  coverUrl?: string;
}

export function getDownloadId(opts: {
  subjectId: string;
  isSeries: boolean;
  season?: number;
  episode?: number;
}): string {
  const { subjectId, isSeries, season = 1, episode = 1 } = opts;
  if (isSeries) return `${subjectId}-s${season}-e${episode}`;
  return `${subjectId}-movie`;
}

async function ensureDir(): Promise<string> {
  try {
    await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
  } catch {
    // Directory already exists; ignore
  }
  return DOWNLOADS_DIR;
}

export async function readDownloads(): Promise<DownloadEntry[]> {
  try {
    const raw = await FileSystem.readAsStringAsync(META_PATH, { encoding: FileSystem.EncodingType.UTF8 });
    const data = JSON.parse(raw) as DownloadEntry[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeDownloads(entries: DownloadEntry[]): Promise<void> {
  await ensureDir();
  await FileSystem.writeAsStringAsync(META_PATH, JSON.stringify(entries, null, 0), {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

export async function addDownload(entry: DownloadEntry): Promise<void> {
  const list = await readDownloads();
  const idx = list.findIndex((e) => e.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  await writeDownloads(list);
}

export async function removeDownload(id: string): Promise<void> {
  const list = await readDownloads();
  const entry = list.find((e) => e.id === id);
  if (entry) {
    try {
      await FileSystem.deleteAsync(entry.filePath, { idempotent: true });
    } catch (_) {}
    await writeDownloads(list.filter((e) => e.id !== id));
  }
}

export function getProxyDownloadUrl(rawMediaUrl: string): string {
  return `${API_BASE_URL}/proxy-stream?url=${encodeURIComponent(rawMediaUrl)}`;
}

/**
 * Download from proxy to app storage and add to metadata.
 * Returns the created DownloadEntry or throws.
 */
export async function downloadToStorage(
  opts: {
    rawMediaUrl: string;
    subjectId: string;
    detailPath: string;
    title: string;
    isSeries: boolean;
    season?: number;
    episode?: number;
    resolution?: number;
    size?: number;
    coverUrl?: string;
  },
  onProgress?: (progress: number) => void
): Promise<DownloadEntry> {
  await ensureDir();
  const id = getDownloadId({
    subjectId: opts.subjectId,
    isSeries: opts.isSeries,
    season: opts.season,
    episode: opts.episode,
  });
  const ext = 'mp4';
  const safeTitle = opts.title.replace(/[^a-zA-Z0-9\-_\s]/g, '').slice(0, 80) || 'video';
  const fileName = opts.isSeries
    ? `${safeTitle}_S${opts.season ?? 1}E${opts.episode ?? 1}.${ext}`
    : `${safeTitle}.${ext}`;
  const filePath = `${DOWNLOADS_DIR}/${fileName}`;

  // Helper to run a download with optional headers and report progress.
  const runDownload = async (
    url: string,
    headers?: Record<string, string>
  ): Promise<{ uri: string; status?: number } | null> => {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      filePath,
      headers ? { headers } : {},
      (downloadProgress) => {
        const written = downloadProgress.totalBytesWritten;
        const total = downloadProgress.totalBytesExpectedToWrite;
        const progress =
          total != null && total > 0 ? Math.min(1, written / total) : 0;
        onProgress?.(progress);
      }
    );

    try {
      const result: any = await downloadResumable.downloadAsync();
      if (!result?.uri) {
        console.log('[download] no uri returned from', url);
        return null;
      }
      if (typeof result.status === 'number' && result.status >= 400) {
        // Treat HTTP errors as failure so we can fall back.
        console.log('[download] http error', result.status, 'for', url);
        return null;
      }
      return { uri: result.uri, status: result.status };
    } catch (e) {
      // Network / other error; let caller decide fallback.
      console.log('[download] error during download', url, String(e));
      return null;
    }
  };

  // STEP 1: Try direct provider URL with required headers.
  console.log('[download] trying direct provider url');
  let result = await runDownload(opts.rawMediaUrl, PROVIDER_HEADERS);

  // STEP 2: Fallback to backend proxy if direct attempt failed or was blocked.
  if (!result) {
    onProgress?.(0);
    try {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    } catch {
      // ignore
    }
    console.log('[download] falling back to proxy');
    const proxyUrl = getProxyDownloadUrl(opts.rawMediaUrl);
    result = await runDownload(proxyUrl);
  }

  if (!result?.uri) {
    console.log('[download] failed after both direct and proxy attempts');
    throw new Error('Download failed');
  }

  const entry: DownloadEntry = {
    id,
    subjectId: opts.subjectId,
    detailPath: opts.detailPath,
    title: opts.title,
    isSeries: opts.isSeries,
    season: opts.season,
    episode: opts.episode,
    filePath: result.uri,
    resolution: opts.resolution,
    size: opts.size,
    downloadedAt: new Date().toISOString(),
    coverUrl: opts.coverUrl,
  };
  await addDownload(entry);
  return entry;
}
