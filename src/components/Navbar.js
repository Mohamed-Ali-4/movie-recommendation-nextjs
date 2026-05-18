'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/mood', label: 'Mood' },
  { href: '/movies', label: 'Browse' },
  { href: '/watchlist', label: 'Watchlist' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href) => pathname === href;

  return (
    <>
      <nav className="navbar">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1>WatchWise</h1>
        </Link>

        <div className="nav-right">
          <div className="nav-links-desktop">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={`nav-btn${isActive(l.href) ? ' nav-btn-active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <button
            className={`nav-hamburger${open ? ' open' : ''}`}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="nav-drawer-backdrop" onClick={() => setOpen(false)} />
            <motion.div
              className="nav-drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
            >
              <button className="nav-drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">&times;</button>
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className={`nav-btn${isActive(l.href) ? ' nav-btn-active' : ''}`}>
                  {l.label}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
