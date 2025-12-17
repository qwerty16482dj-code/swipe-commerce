'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  
  // Если иконок нет, код не упадет, а просто покажет кнопку
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <button 
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-800 rounded text-sm"
      >
        <ChevronLeft className="inline w-4 h-4 mr-1" />
        Назад
      </button>

      <h1 className="text-2xl font-bold text-green-500">
        Чат работает!
      </h1>
      <p className="mt-2 text-gray-400">
        ID товара: {params.id}
      </p>
      
      <div className="mt-8 p-4 border border-gray-700 rounded">
        Здесь скоро будут компоненты чата.
      </div>
    </div>
  );
}