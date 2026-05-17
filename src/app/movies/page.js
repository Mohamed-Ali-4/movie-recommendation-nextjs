'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import API from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';
import '@/styles/Movies.css';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ genre: '', minRating: 0, year: '' });
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchMovies();
  }, [user]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await API.get('/movies');
      setMovies(response.data);
      setFilteredMovies(response.data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') setFilteredMovies(movies);
    else setFilteredMovies(movies.filter(m => m.title.toLowerCase().includes(query.toLowerCase())));
  };

  const handleFilter = () => {
    let results = movies;
    if (filters.genre) results = results.filter(m => m.genre?.includes(filters.genre));
    if (filters.minRating > 0) results = results.filter(m => m.rating >= filters.minRating);
    if (filters.year) results = results.filter(m => String(m.release_year) === filters.year);
    setFilteredMovies(results);
    setShowFilters(false);
  };

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  if (authLoading || !user) {
    return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#a78bfa', fontSize: '1.2rem' }}>Loading...</div>);
  }

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
        <input type="text" placeholder="Search movies by title..." value={searchQuery} onChange={handleSearch} className="search-input" />
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
              <button className="filter-apply" onClick={handleFilter}>Apply Filters</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="content">
        <h2 className="section-title">All Movies ({filteredMovies.length})</h2>
        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : filteredMovies.length > 0 ? (
          <div className="movies-grid">
            {filteredMovies.map(movie => (
              <motion.div key={movie._id} className="movie-card" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
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
        ) : (
          <div className="no-results"><p>No movies found. Try different filters!</p></div>
        )}
      </div>
    </div>
  );
}
