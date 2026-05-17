'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiCheck } from 'react-icons/fi';
import API from '@/lib/api';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import '@/styles/Movies.css';

const MOOD_SUGGESTIONS = [
  'Something light and funny tonight',
  'I want to cry — heartbreaking drama',
  'Edge-of-my-seat thriller',
  'Cozy feel-good with friends',
  'Mind-bending sci-fi',
  'Romantic and dreamy'
];

function MoodPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMood = searchParams.get('q') || '';

  const [mood, setMood] = useState(initialMood);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(false);

  const submit = async (text) => {
    const value = (text ?? mood).trim();
    if (value.length < 2) {
      setError('Tell us a bit more about your mood.');
      return;
    }
    setError('');
    setLoading(true);

    const params = new URLSearchParams(window.location.search);
    params.set('q', value);
    router.replace(`/mood?${params.toString()}`, { scroll: false });

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

  // Auto-submit when arriving with ?q=
  useEffect(() => {
    if (initialMood && !result && !loading) {
      submit(initialMood);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const pickSuggestion = (text) => {
    setMood(text);
    submit(text);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="movies-container">
      <Navbar />

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
            Describe how you feel or what you want to watch. We&apos;ll find movies that match.
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
              className="filter-apply"
              disabled={loading}
              style={{ alignSelf: 'center', width: 'auto', padding: '12px 32px', fontSize: '1rem' }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                  Picks for &ldquo;{result.mood}&rdquo;
                  {result.matchedGenres?.length > 0 && (
                    <span style={{ fontSize: '0.85rem', color: '#a78bfa', marginLeft: 12, fontWeight: 'normal' }}>
                      ({result.matchedGenres.join(', ')})
                    </span>
                  )}
                </h3>
                <button onClick={handleShare} className="nav-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {shared ? <><FiCheck size={14} /> Copied!</> : <><FiShare2 size={14} /> Share</>}
                </button>
              </div>

              {result.results.length === 0 ? (
                <div className="no-results"><p>No matches found. Try rephrasing your mood.</p></div>
              ) : (
                <div className="movies-grid">
                  {result.results.map(movie => (
                    <MovieCard key={movie.tmdbId} movie={movie} />
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

export default function MoodPage() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <MoodPageInner />
    </Suspense>
  );
}
