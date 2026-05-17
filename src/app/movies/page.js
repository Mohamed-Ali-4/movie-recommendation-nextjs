'use client';

import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import API from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';
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
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  const buildEndpoint = (query, genre, pageNum) => {
    const params = new URLSearchParams({ page: String(pageNum) });
    if (query) {
      params.set('q', query);
      return `/tmdb/search?${params.toString()}`;
    }
    if (genre) {
      params.set('genre', genre);
      return `/tmdb/discover?${params.toString()}`;
    }
    return `/tmdb/popular?${params.toString()}`;
  };

  const loadMovies = useCallback(async (query, genre, pageNum, append) => {
    const reqId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await API.get(buildEndpoint(query, genre, pageNum));
      if (reqId !== requestIdRef.current) return;
      setMovies(prev => append ? [...prev, ...res.data.results] : res.data.results);
      setTotalPages(res.data.total_pages || 1);
      setPage(res.data.page || pageNum);
    } catch (err) {
      console.error('Error fetching movies:', err);
      if (!append) setMovies([]);
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const handle = setTimeout(() => {
      loadMovies(searchQuery.trim(), appliedFilters.genre, 1, false);
    }, searchQuery ? 400 : 0);
    return () => clearTimeout(handle);
  }, [user, searchQuery, appliedFilters.genre, loadMovies]);

  const handleLoadMore = () => {
    if (page >= totalPages || loadingMore) return;
    loadMovies(searchQuery.trim(), appliedFilters.genre, page + 1, true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setShowFilters(false);
  };

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const visibleMovies = movies.filter(m => {
    if (appliedFilters.minRating > 0 && (m.rating || 0) < appliedFilters.minRating) return false;
    if (appliedFilters.year && String(m.release_year) !== String(appliedFilters.year)) return false;
    return true;
  });

  if (authLoading || !user) {
    return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#a78bfa', fontSize: '1.2rem' }}>Loading...</div>);
  }

  const headerLabel = searchQuery
    ? `Results for "${searchQuery}"`
    : appliedFilters.genre
      ? `${appliedFilters.genre} movies`
      : 'Popular movies';

  return (
    <div className="movies-container">
      <nav className="navbar">
        <h1>WatchWise</h1>
        <div className="nav-right">
          <span className="nav-user">Welcome, {user?.name}!</span>
          <button className="nav-btn" onClick={() => setShowFilters(!showFilters)}>Filters</button>
          <button className="nav-btn nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search movies by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
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
        ) : visibleMovies.length > 0 ? (
          <>
            <div className="movies-grid">
              {visibleMovies.map(movie => (
                <motion.div key={movie.tmdbId} className="movie-card" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <div className="movie-poster">
                    <img src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'} alt={movie.title} onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }} />
                  </div>
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="movie-rating">Rating: {movie.rating}/10</div>
                    <div className="movie-year">{movie.release_year}</div>
                    <div className="movie-genres">
                      {movie.genre?.slice(0, 2).map(g => (<span key={g} className="genre-tag">{g}</span>))}
                    </div>
                  </div>
                </motion.div>
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
          <div className="no-results"><p>No movies found. Try a different search or filters!</p></div>
        )}
      </div>
    </div>
  );
}
