'use client';

const KEY = 'watchwise:watchlist';

function read() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function write(items) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('watchlist:change'));
}

export function getWatchlist() {
  return read();
}

export function isInWatchlist(tmdbId) {
  return read().some(m => m.tmdbId === tmdbId);
}

export function addToWatchlist(movie) {
  const items = read();
  if (items.some(m => m.tmdbId === movie.tmdbId)) return items;
  const next = [
    {
      tmdbId: movie.tmdbId,
      title: movie.title,
      poster_url: movie.poster_url,
      rating: movie.rating,
      release_year: movie.release_year,
      genre: movie.genre || []
    },
    ...items
  ];
  write(next);
  return next;
}

export function removeFromWatchlist(tmdbId) {
  const next = read().filter(m => m.tmdbId !== tmdbId);
  write(next);
  return next;
}

export function toggleWatchlist(movie) {
  return isInWatchlist(movie.tmdbId)
    ? removeFromWatchlist(movie.tmdbId)
    : addToWatchlist(movie);
}
