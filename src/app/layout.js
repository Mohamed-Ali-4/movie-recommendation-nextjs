import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'CineAI - AI Movie Recommendations',
  description: 'Discover movies with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
