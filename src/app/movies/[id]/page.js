'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBookmark, FiCheck, FiPlay } from 'react-icons/fi';
import API from '@/lib/api';
import Navbar from '@/components/Navbar';
import { isInWatchlist, toggleWatchlist } from '@/lib/watchlist';
import '@/styles/Movies.css';
import '@/styles/Detail.css';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    API.get(`/tmdb/movie/${id}`)
      .then(res => {
        if (cancelled) return;
        setMovie(res.data);
        setSaved(isInWatchlist(res.data.tmdbId));
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Failed to load movie.');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const sync = () => movie && setSaved(isInWatchlist(movie.tmdbId));
    window.addEventListener('watchlist:change', sync);
    return () => window.removeEventListener('watchlist:change', sync);
  }, [movie]);

  const handleSave = () => {
    if (!movie) return;
    toggleWatchlist(movie);
  };

  if (loading) {
    return (
      <div className="movies-container">
        <Navbar />
        <div className="loading">Loading movie…</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movies-container">
        <Navbar />
        <div className="content" style={{ paddingTop: 32 }}>
          <button className="nav-btn" onClick={() => router.back()}>
            <FiArrowLeft /> Back
          </button>
          <div className="no-results"><p>{error || 'Movie not found.'}</p></div>
        </div>
      </div>
    );
  }

  const backdropStyle = movie.backdrop_url
    ? { backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.95) 80%, #131b2e 100%), url(${movie.backdrop_url})` }
    : {};

  return (
    <div className="movies-container">
      <Navbar />

      <div className="detail-hero" style={backdropStyle}>
        <div className="detail-hero-inner">
          <button className="nav-btn" onClick={() => router.back()} style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
            <FiArrowLeft style={{ verticalAlign: 'middle' }} /> Back
          </button>

          <motion.div
            className="detail-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="detail-poster">
              <img
                src={movie.poster_url || 'https://via.placeholder.com/400x600?text=No+Poster'}
                alt={movie.title}
              />
            </div>

            <div className="detail-info">
              <h1>{movie.title} {movie.release_year && <span className="detail-year">({movie.release_year})</span>}</h1>
              {movie.tagline && <p className="detail-tagline">{movie.tagline}</p>}

              <div className="detail-meta">
                <span className="detail-rating">★ {movie.rating}/10</span>
                {movie.runtime && <span>{movie.runtime} min</span>}
                {movie.language && <span>{movie.language.toUpperCase()}</span>}
              </div>

              <div className="movie-genres" style={{ marginBottom: 16 }}>
                {movie.genre?.map(g => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>

              <p className="detail-description">{movie.description || 'No description available.'}</p>

              {movie.director && (
                <p className="detail-credit"><strong>Director:</strong> {movie.director}</p>
              )}
              {movie.cast?.length > 0 && (
                <p className="detail-credit"><strong>Cast:</strong> {movie.cast.join(', ')}</p>
              )}

              <div className="detail-actions">
                {movie.trailer_url && (
                  <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className="filter-apply" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', textDecoration: 'none' }}>
                    <FiPlay /> Watch trailer
                  </a>
                )}
                <button onClick={handleSave} className="nav-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
                  {saved ? <><FiCheck /> In watchlist</> : <><FiBookmark /> Add to watchlist</>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
