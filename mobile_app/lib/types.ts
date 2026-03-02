/**
 * API types for MovieBox backend.
 * subjectType: 1 = Movie, 2 = TV Series.
 */

export const SubjectType = {
  All: 0,
  Movie: 1,
  TV: 2,
} as const;

export type SubjectTypeValue = (typeof SubjectType)[keyof typeof SubjectType];

// --- Image / cover ---
export interface ImageRef {
  url: string;
  width?: number;
  height?: number;
}

// --- Banner (home) ---
export interface BannerItem {
  title: string;
  image: ImageRef;
  subjectId: string;
  subjectType: number;
  url?: string;
  detailPath?: string;
}

export interface BannerBlock {
  title: string;
  banner: { items: BannerItem[] };
}

export interface SubjectItem {
  title: string;
  subjectId: string;
  subjectType: number;
  cover?: ImageRef;
  image?: ImageRef;
  imdbRatingValue?: number;
  url?: string;
  detailPath?: string;
}

export interface SubjectsBlock {
  title: string;
  subjects: SubjectItem[];
}

export type OperatingListItem = BannerBlock | SubjectsBlock;

export interface HomeResponse {
  operatingList: OperatingListItem[];
}

// --- Trending / Search (paginated) ---
export interface Pager {
  hasMore: boolean;
  nextPage: number;
  page: number;
}

export interface TrendingItem extends SubjectItem {
  cover?: ImageRef;
  imdbRatingValue?: number;
}

export interface TrendingResponse {
  pager: Pager;
  items: TrendingItem[];
}

// --- Ranks ---
export interface RankItem {
  title: string;
  subjectId: string;
  [key: string]: unknown;
}

export interface RanksResponse {
  movie: RankItem[];
  tv: RankItem[];
}

// --- Search suggest ---
export interface SuggestItem {
  word: string;
  type: number;
}

export interface SearchSuggestResponse {
  items: SuggestItem[];
  keyword: string;
}

// --- Popular searches ---
export type PopularSearchItem = { title: string };

// --- Details ---
export interface Star {
  name: string;
  character?: string;
}

export interface SubjectDetail {
  title: string;
  description?: string;
  genre?: string[] | string;
  releaseDate?: string;
  imdbRatingValue?: number;
  stars?: Star[];
  cover?: ImageRef;
  image?: ImageRef;
  subjectId?: string;
  subjectType?: number;
  url?: string;
  detailPath?: string;
  [key: string]: unknown;
}

/** Season info (TV series only). Backend: resData.resource.seasons[]. */
export interface SeriesSeason {
  se: number;
  maxEp: number;
  allEp?: string;
  resolutions?: { resolution: number; epNum?: number }[];
}

/** Resource with seasons (TV series only). Backend: resData.resource */
export interface SeriesResource {
  seasons: SeriesSeason[];
  source?: string;
  uploadBy?: string;
}

export interface DetailsResponse {
  resData: {
    subject: SubjectDetail;
    /** Present for TV series only */
    resource?: SeriesResource;
  };
}

// --- Recommendations: same list shape as search/trending ---

// --- Media info (stream) ---
export interface DownloadItem {
  resolution: number;
  size: number;
  url: string;
}

export interface CaptionItem {
  lan: string;
  lanName: string;
  url: string;
}

export interface MediaInfoResponse {
  downloads: DownloadItem[];
  captions: CaptionItem[];
}
