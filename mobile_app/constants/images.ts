/**
 * Fixed image dimensions for consistent layout.
 * Poster aspect ratio 2:3 (width : height).
 */
export const POSTER_ASPECT = 2 / 3;

/** Poster width for horizontal lists (e.g. Home trending) */
export const POSTER_WIDTH_SM = 120;
export const POSTER_HEIGHT_SM = Math.round(POSTER_WIDTH_SM / POSTER_ASPECT); // 180

/** Poster for grid (Explore/Search) - use with card width from layout */
export const POSTER_WIDTH_MD = 160;
export const POSTER_HEIGHT_MD = Math.round(POSTER_WIDTH_MD / POSTER_ASPECT); // 240

/** Poster for detail "More like this" row */
export const POSTER_WIDTH_XS = 100;
export const POSTER_HEIGHT_XS = Math.round(POSTER_WIDTH_XS / POSTER_ASPECT); // 150

/** Hero / backdrop fixed height */
export const HERO_HEIGHT = 380;
export const BACKDROP_HEIGHT = 360;
