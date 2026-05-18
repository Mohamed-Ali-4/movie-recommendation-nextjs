const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

// Fallback TMDB key. Override by setting TMDB_API_KEY in Vercel env vars.
const FALLBACK_TMDB_KEY = 'cc9f91432c0827e27f5c1de3618f6dc6';

export const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

export const GENRE_NAME_TO_ID = Object.fromEntries(
  Object.entries(GENRE_MAP).map(([id, name]) => [name.toLowerCase(), parseInt(id)])
);

async function tmdbGet(path, params = {}, revalidate = 300) {
  const key = process.env.TMDB_API_KEY || FALLBACK_TMDB_KEY;
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) throw new Error(`TMDB ${path} returned ${res.status}`);
  return res.json();
}

function mapItem(m) {
  return {
    tmdbId: m.id,
    title: m.title || m.name || 'Untitled',
    description: m.overview || '',
    poster_url: m.poster_path ? `${POSTER_BASE}${m.poster_path}` : null,
    backdrop_url: m.backdrop_path ? `${BACKDROP_BASE}${m.backdrop_path}` : null,
    release_year: m.release_date ? parseInt(m.release_date) : null,
    rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : 0,
    genre: (m.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean)
  };
}

function wrapList(data) {
  return {
    page: data.page,
    total_pages: Math.min(data.total_pages || 1, 500),
    total_results: data.total_results || 0,
    results: (data.results || []).filter(m => !m.adult).map(mapItem)
  };
}

export async function listMovies(category, page = 1) {
  return wrapList(await tmdbGet(`/movie/${category}`, { page }));
}

export async function searchMovies(query, page = 1) {
  return wrapList(await tmdbGet('/search/movie', { query, page, include_adult: false }, 60));
}

export async function discoverByGenre(genreIds, page = 1) {
  return wrapList(await tmdbGet('/discover/movie', {
    with_genres: genreIds,
    page,
    include_adult: false,
    sort_by: 'popularity.desc'
  }));
}

export async function getMovieDetails(id) {
  const data = await tmdbGet(`/movie/${id}`, { append_to_response: 'credits,videos' }, 3600);
  if (data.adult) return null;
  const director = data.credits?.crew?.find(p => p.job === 'Director')?.name || null;
  const cast = (data.credits?.cast || []).slice(0, 8).map(c => c.name);
  const trailer = (data.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');
  return {
    tmdbId: data.id,
    title: data.title,
    description: data.overview || '',
    poster_url: data.poster_path ? `${POSTER_BASE}${data.poster_path}` : null,
    backdrop_url: data.backdrop_path ? `${BACKDROP_BASE}${data.backdrop_path}` : null,
    release_year: data.release_date ? parseInt(data.release_date) : null,
    rating: data.vote_average ? parseFloat(data.vote_average.toFixed(1)) : 0,
    runtime: data.runtime || null,
    genre: (data.genres || []).map(g => g.name),
    director,
    cast,
    trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    language: data.original_language,
    tagline: data.tagline || ''
  };
}
