import type { SubjectItem, BannerItem } from '@/lib/types';

const DETAIL_PATH = '/detail';

/**
 * Build the detail URL for /details API.
 * Backend expects: /detail/{detailPath}?id={subjectId}
 */
export function getDetailUrl(item: SubjectItem | BannerItem): string {
  const path = 'detailPath' in item ? item.detailPath : (item as SubjectItem).detailPath;
  const id = item.subjectId;
  if (path && id) {
    return `${DETAIL_PATH}/${path}?id=${id}`;
  }
  return (item as SubjectItem).url ?? (item as BannerItem).url ?? '';
}

/** Item may have detailPath (camelCase) or detail_path (snake_case from API) */
function getDetailPath(item: SubjectItem | BannerItem): string | undefined {
  const sub = item as SubjectItem & { detail_path?: string };
  return sub.detailPath ?? sub.detail_path ?? (item as BannerItem).detailPath;
}

/**
 * Get detailPath and subjectId for navigation (avoids encoding issues with full url in params).
 */
export function getDetailParams(item: SubjectItem | BannerItem): { detailPath: string; subjectId: string } {
  const path = getDetailPath(item);
  const id = item.subjectId ?? (item as SubjectItem & { subject_id?: string }).subject_id ?? '';
  if (path && id) {
    return { detailPath: path, subjectId: String(id) };
  }
  const rawUrl = (item as SubjectItem).url ?? (item as BannerItem).url ?? '';
  const match = rawUrl.match(/\/detail\/([^?]+)(?:\?id=([^&]+))?/);
  if (match) {
    return { detailPath: match[1], subjectId: match[2] ?? String(id) };
  }
  return { detailPath: path ?? rawUrl, subjectId: String(id) };
}

/** Capitalize first letter of each word for display titles */
export function capitalizeTitle(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
