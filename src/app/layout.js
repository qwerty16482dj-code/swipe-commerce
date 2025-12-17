import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

// 1. Метаданные (Название, Описание, Иконки)
export const metadata = {
  title: 'Swipe Commerce',
  description: 'Future of shopping',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SwipeShop',
  },
};

// 2. Вьюпорт (Настройки экрана и цвета) - ТЕПЕРЬ ОТДЕЛЬНО
export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Запрет зума
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-black min-h-screen text-white overscroll-none`}>
        {children}
      </body>
    </html>
  );
}