'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext) || {};
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout?.();
    router.push('/');
  };

  const linkClass = (href) =>
    `nav-btn ${pathname === href ? 'nav-btn-active' : ''}`;

  return (
    <nav className="navbar">
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1>WatchWise</h1>
      </Link>
      <div className="nav-right">
        <Link href="/mood" className={linkClass('/mood')}>Mood</Link>
        <Link href="/movies" className={linkClass('/movies')}>Browse</Link>
        <Link href="/watchlist" className={linkClass('/watchlist')}>Watchlist</Link>
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="nav-btn nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link href="/auth/login" className="nav-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}
