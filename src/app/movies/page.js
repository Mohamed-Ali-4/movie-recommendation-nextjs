'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFilter } from 'react-icons/fi';
import API from '@/lib/api';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import '@/styles/Movies.css';

const DEFAULT_FILTERS = { genre: '', minRating: 0, year: '' };

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [apiError, setApiError] = useState('');
  const requestIdRef = useRef(0);

  const buildEndpoint = (query, genre, pageNum) => {
    const params = new URLSearchParams({ page: String(pageNum) });
    if (query) { params.set('q', query); return `/tmdb/search?${params}`; }
    if (genre) { params.set('genre', genre); return `/tmdb/discover?${params}`; }
    return `/tmdb/popular?${params}`;
  };

  const loadMovies = useCallback(async (query, genre, pageNum, append) => {
    const reqId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else { setLoading(true); setApiError(''); }
    try {
      const res = await API.get(buildEndpoint(query, genre, pageNum));
      if (reqId !== requestIdRef.current) return;
      setMovies(prev => append ? [...prev, ...res.data.results] : res.data.results);
      setTotalPages(res.data.total_pages || 1);
      setPage(res.data.page || pageNum);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      const msg = err.response?.data?.message || err.message || 'Failed to load movies';
      if (!append) { setMovies([]); setApiError(msg); }
    } finally {
      if (reqId === requestIdRef.current) { setLoading(false); setLoadingMore(false); }
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      loadMovies(searchQuery.trim(), appliedFilters.genre, 1, false);
    }, searchQuery ? 400 : 0);
    return () => clearTimeout(handle);
  }, [searchQuery, appliedFilters.genre, loadMovies]);

  const handleLoadMore = () => {
    if (page >= totalPages || loadingMore) return;
    loadMovies(searchQuery.trim(), appliedFilters.genre, page + 1, true);
  };

  const handleApplyFilters = () => { setAppliedFilters(filters); setShowFilters(false); };
  const handleClearFilters = () => { setFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); setShowFilters(false); };

  const visibleMovies = movies.filter(m => {
    if (appliedFilters.minRating > 0 && (m.rating || 0) < appliedFilters.minRating) return false;
    if (appliedFilters.year && String(m.release_year) !== String(appliedFilters.year)) return false;
    return true;
  });

  const headerLabel = searchQuery
    ? `Results for "${searchQuery}"`
    : appliedFilters.genre ? `${appliedFilters.genre} movies` : 'Popular movies';

  return (
    <div className="movies-container">
      <Navbar />

      <div className="search-section">
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="nav-btn" onClick={() => setShowFilters(!showFilters)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div className="filter-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} />
            <motion.div className="filter-panel" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ duration: 0.3 }}>
              <div className="filter-header">
                <h3>Filter Movies</h3>
                <button onClick={() => setShowFilters(false)}><FiX size={24} /></button>
              </div>
              <div className="filter-section">
                <label>Genre</label>
                <input type="text" placeholder="e.g., Action, Drama" value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })} />
              </div>
              <div className="filter-section">
                <label>Min Rating</label>
                <input type="range" min="0" max="10" step="0.5" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })} />
                <p>{filters.minRating}</p>
              </div>
              <div className="filter-section">
                <label>Year</label>
                <input type="number" placeholder="e.g., 2020" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
              </div>
              <button className="filter-apply" onClick={handleApplyFilters}>Apply Filters</button>
              <button className="filter-apply" style={{ marginTop: 8, background: 'transparent', border: '1px solid #a78bfa' }} onClick={handleClearFilters}>Clear</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="content">
        <h2 className="section-title">{headerLabel} ({visibleMovies.length})</h2>
        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : apiError ? (
          <div className="no-results">
            <p style={{ color: '#f87171', marginBottom: 8 }}>Could not load movies.</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{apiError}</p>
          </div>
        ) : visibleMovies.length > 0 ? (
          <>
            <div className="movies-grid">
              {visibleMovies.map(movie => (
                <MovieCard key={movie.tmdbId} movie={movie} />
              ))}
            </div>
            {page < totalPages && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button className="nav-btn" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results"><p>No movies found. Try a different search or filters.</p></div>
        )}
      </div>
    </div>
  );
}
