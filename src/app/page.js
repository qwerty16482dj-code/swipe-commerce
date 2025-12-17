'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import Card from '../components/feed/Card';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [userVector, setUserVector] = useState([0,0,0,0,0, 0,0,0]); 
  const [viewedIds, setViewedIds] = useState([]); 
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(Date.now());

  // Логику загрузки оставляем, она работает скрыто
  const fetchRecommendations = async (currentVector, exclude) => {
    setLoading(true);
    
    // 1. Узнаем, кто мы (чтобы скрыть свои товары)
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // 2. Запрашиваем товары
    const { data, error } = await supabase.rpc('match_products', {
      query_embedding: currentVector,
      match_threshold: 0.0, 
      match_count: 10,
      exclude_ids: exclude
    });

    if (error) console.error('Ошибка ML:', error);
    
    // 3. Фильтр своих товаров
    const validProducts = (data || []).filter(p => p.owner_id !== currentUserId);

    setProducts(validProducts.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    const savedVector = localStorage.getItem('user_preference_vector');
    const savedViewed = localStorage.getItem('viewed_products');
    let vectorToUse = [0,0,0,0,0, 0,0,0];
    let viewedToUse = [];

    if (savedVector) {
      const parsed = JSON.parse(savedVector);
      if (parsed.length === 8) {
         vectorToUse = parsed;
         setUserVector(vectorToUse);
      }
    }
    if (savedViewed) {
        viewedToUse = JSON.parse(savedViewed);
        setViewedIds(viewedToUse);
    }
    fetchRecommendations(vectorToUse, viewedToUse);
  }, []);

  const activeProduct = products[0];
  const nextProduct = products[1];

  useEffect(() => {
    if (activeProduct) startTimeRef.current = Date.now();
  }, [activeProduct]);

  const updateUserVector = (productEmbedding, weight) => {
    const productVec = JSON.parse(productEmbedding || '[0,0,0,0,0,0,0,0]');
    const isZero = userVector.every(v => v === 0);
    let newVector;
    if (isZero) {
        newVector = productVec;
    } else {
        newVector = userVector.map((val, i) => 
            (val + (productVec[i] * weight)) / (1 + weight)
        );
    }
    setUserVector(newVector);
    localStorage.setItem('user_preference_vector', JSON.stringify(newVector));
    return newVector;
  };

  const handleDescriptionExpand = () => {
      if (!activeProduct) return;
      updateUserVector(activeProduct.embedding, 1.5);
  };

  const handleLike = async () => {
    if (!activeProduct) return;
    const duration = Date.now() - startTimeRef.current;
    const weight = duration > 3000 ? 2.5 : 1.5; 
    updateUserVector(activeProduct.embedding, weight);

    const newViewed = [...viewedIds, activeProduct.id];
    setViewedIds(newViewed);
    localStorage.setItem('viewed_products', JSON.stringify(newViewed));

    const { data } = await supabase.from('matches').insert([{ 
        product_id: activeProduct.id, 
        current_price: activeProduct.price,
        status: 'bargaining'
    }]).select().single();

    setTimeout(() => {
        router.push(`/chat/${data.id}`);
    }, 300);
  };

  const handleDislike = () => {
    if (!activeProduct) return;
    const duration = Date.now() - startTimeRef.current;
    if (duration > 4000) {
        updateUserVector(activeProduct.embedding, 0.2);
    }
    const newViewed = [...viewedIds, activeProduct.id];
    setViewedIds(newViewed);
    localStorage.setItem('viewed_products', JSON.stringify(newViewed));
    const remainingProducts = products.slice(1);
    if (remainingProducts.length < 2) {
        fetchRecommendations(userVector, newViewed);
    } else {
        setProducts(remainingProducts);
    }
  };

  // Функция сброса осталась в коде, но скрыта из UI
  const handleReset = () => {
      localStorage.removeItem('user_preference_vector');
      localStorage.removeItem('viewed_products');
      window.location.reload();
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 overflow-hidden touch-none">
      
      {/* 1. Кнопка ПРОФИЛЬ / ВХОД (Единственная кнопка сверху) */}
      <Link href="/login">
        <div className="absolute top-6 right-6 z-50 p-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white cursor-pointer hover:bg-white/20 transition active:scale-95">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
           </svg>
        </div>
      </Link>

      {/* 2. Контент Ленты */}
      <div className="relative w-full h-screen p-4 flex items-center justify-center max-w-md">
        
        {loading && products.length === 0 ? (
            <div className="text-white animate-pulse">Загрузка...</div>
        ) : !activeProduct ? (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 text-white">Лента пуста!</h2>
                <p className="text-gray-400 mb-6 text-sm">Показывать больше нечего.</p>
                <button onClick={handleReset} className="px-6 py-3 bg-blue-600 rounded-full font-bold text-white hover:bg-blue-500 transition">
                    Начать сначала
                </button>
            </div>
        ) : (
            <>
                {nextProduct && (
                  <div className="absolute inset-4 z-0 transform scale-95 opacity-40 translate-y-4 filter blur-[2px] transition-all duration-500 pointer-events-none">
                     <Card product={nextProduct} />
                  </div>
                )}
                <div className="absolute inset-4 z-10">
                  <Card 
                    key={activeProduct.id} 
                    product={activeProduct} 
                    onLike={handleLike} 
                    onDislike={handleDislike}
                    onExpand={handleDescriptionExpand}
                  />
                </div>
            </>
        )}
      </div>

      {/* 3. Нижние кнопки навигации */}
      
      {/* Сообщения (Слева) */}
      <Link href="/matches">
        <div className="absolute bottom-6 left-6 w-14 h-14 bg-gray-800 border border-white/10 text-white rounded-full flex items-center justify-center shadow-lg z-50 active:scale-90 transition-transform cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
           </svg>
        </div>
      </Link>

      {/* Продать (Справа) */}
      <Link href="/sell">
        <div className="absolute bottom-6 right-6 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg shadow-white/20 z-50 active:scale-90 transition-transform cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <path d="M5 12h14"/><path d="M12 5v14"/>
           </svg>
        </div>
      </Link>

    </main>
  );
}