'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookmark, FiCheck } from 'react-icons/fi';
import { isInWatchlist, toggleWatchlist } from '@/lib/watchlist';

export default function MovieCard({ movie }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isInWatchlist(movie.tmdbId));
    sync();
    window.addEventListener('watchlist:change', sync);
    return () => window.removeEventListener('watchlist:change', sync);
  }, [movie.tmdbId]);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  return (
    <Link href={`/movies/${movie.tmdbId}`} style={{ textDecoration: 'none' }}>
      <motion.div
        className="movie-card"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="movie-poster" style={{ position: 'relative' }}>
          <img
            src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}
            alt={movie.title}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
          />
          <button
            onClick={handleSave}
            aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
            className="watchlist-toggle"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: saved ? 'rgba(34, 197, 94, 0.9)' : 'rgba(15, 23, 42, 0.75)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'background 200ms'
            }}
          >
            {saved ? <FiCheck size={18} /> : <FiBookmark size={18} />}
          </button>
        </div>
        <div className="movie-info">
          <h3>{movie.title}</h3>
          <div className="movie-rating">Rating: {movie.rating}/10</div>
          <div className="movie-year">{movie.release_year}</div>
          <div className="movie-genres">
            {movie.genre?.slice(0, 2).map(g => (
              <span key={g} className="genre-tag">{g}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
