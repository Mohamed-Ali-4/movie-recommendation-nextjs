'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';
import '@/styles/Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await API.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      router.push('/movies');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-overlay" />
      <div className="auth-navbar">
        <Link href="/" className="auth-logo">WatchWise</Link>
      </div>
      <div className="auth-wrapper">
        <div className="auth-box">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to get your personalised movie picks.</p>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
          <div className="auth-divider">New to WatchWise?</div>
          <Link href="/auth/signup" className="auth-secondary-btn">Create an account</Link>
          <p className="auth-terms">By continuing you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
