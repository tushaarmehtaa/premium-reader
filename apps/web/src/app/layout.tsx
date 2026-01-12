import type { Metadata } from 'next';
import { Inter, Merriweather, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'], // Added weights for finer control
  style: ['normal', 'italic'],
  variable: '--font-merriweather',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sutra | The Art of Deep Reading',
  description: 'Extract the signal from the noise. Transform any article into a timeless reading experience.',
  icons: {
    icon: '/favicon.ico', // We can generate a proper svg later
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} ${playfair.variable} scroll-smooth`}
    >
      <body className="antialiased bg-paper text-ink selection:bg-accent-amber/10 selection:text-ink">
        {/* Subtle noise grain for paper texture could go here if requested, keeping it clean for now */}
        {children}
      </body>
    </html>
  );
}
