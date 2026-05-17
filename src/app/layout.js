import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://movie-recommendation-nextjs-mu.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'WatchWise — Mood-Based Movie Recommendations',
    template: '%s | WatchWise'
  },
  description: 'Tell WatchWise how you feel and get instant movie recommendations. Discover films by mood, browse top-rated picks, and save your watchlist.',
  keywords: ['WatchWise', 'mood movie recommendations', 'movie finder', 'what to watch', 'AI movie picks', 'movie suggestions by mood', 'moodflix alternative'],
  authors: [{ name: 'WatchWise' }],
  applicationName: 'WatchWise',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'WatchWise',
    title: 'WatchWise — Mood-Based Movie Recommendations',
    description: 'Tell WatchWise how you feel and get instant movie recommendations.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'WatchWise' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WatchWise — Mood-Based Movie Recommendations',
    description: 'Tell WatchWise how you feel and get instant movie recommendations.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: SITE_URL
  }
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WatchWise',
  description: 'Mood-based movie recommendations powered by AI.',
  url: SITE_URL,
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
