import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { StorefrontShell } from '@/components/layout/StorefrontShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sivakasi Crackers | Premium Online Fireworks Store',
  description: 'Buy certified green fireworks and ready-made Diwali celebration packages directly from Sivakasi factory rates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-[#FAF8F5] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-white`}>
        <CartProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}
