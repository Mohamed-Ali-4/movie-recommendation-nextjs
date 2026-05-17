'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';
import '@/styles/Auth.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const genreOptions = ['Action', 'Sci-Fi', 'Thriller', 'Drama', 'Comedy', 'Horror', 'Romance', 'Adventure', 'Fantasy', 'Crime', 'Mystery', 'Documentary'];

  const togglePreference = (genre) => {
    setPreferences(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (preferences.length === 0) { setError('Please select at least one genre'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await API.post('/auth/signup', { name, email, password, preferences });
      login(response.data.user, response.data.token);
      router.push('/movies');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-overlay"></div>
      <div className="auth-navbar"><h1 className="auth-logo">WatchWise</h1></div>
      <div className="auth-wrapper">
        <div className="auth-box auth-box-wide">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join WatchWise and discover movies you will love!</p>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group"><input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="input-group"><input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="input-group"><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div className="preferences-section">
              <p className="preferences-title">What do you love watching?</p>
              <p className="preferences-subtitle">Select your favorite genres</p>
              <div className="genre-grid">
                {genreOptions.map(genre => (
                  <button key={genre} type="button" className={`genre-btn ${preferences.includes(genre) ? 'selected' : ''}`} onClick={() => togglePreference(genre)}>
                    <span className="genre-name">{genre}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Creating account...' : 'Get Started'}</button>
          </form>
          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link href="/auth/login" className="auth-secondary-btn">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
