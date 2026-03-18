import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'iMaintenance - Gestor de Instruções',
  description: 'Gestor elegante de instruções de manutenção de sites.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body suppressHydrationWarning className="bg-[#F5F5F7] text-[#1D1D1F] antialiased">
        {children}
      </body>
    </html>
  );
}
