import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Libwise | Virtual Library',
  description: 'Your premium digital library for PDFs and Books.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-surface-base text-text-main min-h-screen selection:bg-primary-500/30 selection:text-white antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
