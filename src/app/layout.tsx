import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Zentura Finance — High-Performance Identity & Financial Platform',
  description:
    'Production-grade NestJS 11 + Fastify backend with hardened Redis session architecture, Bloom filters, BullMQ transactional email, and Next.js frontend.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Navbar />
              <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
