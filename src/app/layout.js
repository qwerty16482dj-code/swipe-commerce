import { Inter } from 'next/font/google'; // 1. Импорт шрифта
import './globals.css';

// Настраиваем шрифт
const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata = {
  title: 'Swipe Commerce',
  description: 'Future of shopping',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      {/* 2. Применяем шрифт и градиентный фон ко всему body */}
      <body className={`${inter.className} bg-gradient-to-b from-gray-900 to-black min-h-screen text-white overscroll-none`}>
        {children}
      </body>
    </html>
  );
}