import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tiki Taka - Ordina il pranzo',
  description: 'Ordina il tuo pranzo e ricevilo direttamente in azienda.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#14213D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`}>
        <div className="max-w-lg mx-auto w-full bg-white min-h-screen flex flex-col shadow-sm relative">
          {children}
        </div>
      </body>
    </html>
  );
}
