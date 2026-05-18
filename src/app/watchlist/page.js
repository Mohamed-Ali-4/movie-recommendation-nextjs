'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { getWatchlist } from '@/lib/watchlist';
import '@/styles/Movies.css';

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getWatchlist());
    sync();
    setHydrated(true);
    window.addEventListener('watchlist:change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('watchlist:change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <div className="movies-container">
      <Navbar />
      <div className="content" style={{ paddingTop: 32 }}>
        <h2 className="section-title">Your watchlist ({items.length})</h2>

        {!hydrated ? (
          <div className="loading">Loading&hellip;</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing saved yet</h3>
            <p style={{ marginBottom: 20 }}>Tap the bookmark on any movie to add it here.</p>
            <Link href="/mood" className="filter-apply" style={{ display: 'inline-block', width: 'auto', padding: '12px 24px', textDecoration: 'none' }}>
              Find something to watch
            </Link>
          </div>
        ) : (
          <div className="movies-grid">
            {items.map(movie => (
              <MovieCard key={movie.tmdbId} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
