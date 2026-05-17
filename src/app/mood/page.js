'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import API from '@/lib/api';
import '@/styles/Movies.css';

const MOOD_SUGGESTIONS = [
  'Something light and funny tonight',
  'I want to cry — heartbreaking drama',
  'Edge-of-my-seat thriller',
  'Cozy feel-good with friends',
  'Mind-bending sci-fi',
  'Romantic and dreamy'
];

export default function MoodPage() {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (text) => {
    const value = (text ?? mood).trim();
    if (value.length < 2) {
      setError('Tell us a bit more about your mood.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/recommendations/mood', { mood: value });
      setResult(res.data);
    } catch (err) {
      console.error('Mood request failed:', err);
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const pickSuggestion = (text) => {
    setMood(text);
    submit(text);
  };

  return (
    <div className="movies-container">
      <nav className="navbar">
        <h1>WatchWise</h1>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => router.push('/movies')}>Browse</button>
          <button className="nav-btn" onClick={() => router.push('/auth/login')}>Login</button>
        </div>
      </nav>

      <div className="content" style={{ paddingTop: 32 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}
        >
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>
            What are you in the mood for?
          </h2>
          <p style={{ color: '#a78bfa', marginBottom: 24 }}>
            Describe how you feel or what you want to watch. We'll find movies that match.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              className="search-input"
              placeholder="e.g., I want something funny and feel-good to relax after a long day"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              rows={3}
              maxLength={500}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <button
              type="submit"
              className="nav-btn"
              disabled={loading}
              style={{ alignSelf: 'center', padding: '12px 32px', fontSize: '1rem' }}
            >
              {loading ? 'Finding movies…' : 'Find movies'}
            </button>
          </form>

          {error && (
            <p style={{ color: '#f87171', marginTop: 12 }}>{error}</p>
          )}

          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {MOOD_SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => pickSuggestion(s)}
                disabled={loading}
                className="genre-tag"
                style={{ cursor: 'pointer', border: 'none', background: 'rgba(167, 139, 250, 0.15)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              key={result.mood}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 48 }}
            >
              <h3 className="section-title" style={{ marginBottom: 16 }}>
                Picks for &ldquo;{result.mood}&rdquo;
                {result.matchedGenres?.length > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#a78bfa', marginLeft: 12, fontWeight: 'normal' }}>
                    ({result.matchedGenres.join(', ')})
                  </span>
                )}
              </h3>

              {result.results.length === 0 ? (
                <div className="no-results"><p>No matches found. Try rephrasing your mood.</p></div>
              ) : (
                <div className="movies-grid">
                  {result.results.map(movie => (
                    <motion.div
                      key={movie.tmdbId}
                      className="movie-card"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="movie-poster">
                        <img
                          src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}
                          alt={movie.title}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                        />
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
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
