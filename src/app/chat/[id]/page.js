'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import MessageList from '../../../components/chat/MessageList';
import TradePanel from '../../../components/chat/TradePanel';

export default function ChatPage() {
  const router = useRouter();
  const { id: matchId } = useParams();

  const [matchData, setMatchData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояния пользователя и роли
  const [currentUser, setCurrentUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    let channel = null;

    async function loadChat() {
      try {
        // 1. Узнаем, кто сейчас смотрит страницу
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // 2. Грузим сделку и инфо о товаре
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select(`*, products (title, price, image, owner_id)`)
          .eq('id', matchId)
          .single();
        
        if (matchError) throw matchError;
        setMatchData(match);

        // 3. АВТО-ОПРЕДЕЛЕНИЕ: Я продавец?
        if (user && match.products.owner_id === user.id) {
            setIsSeller(true);
        }

        // 4. Грузим сообщения
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: true });

        setMessages(msgs || []);

        // 5. Подключаем Realtime
        const channelName = `chat_room_${matchId}_${Date.now()}`;
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
            (payload) => {
               if (payload.eventType === 'INSERT') {
                 setMessages(prev => {
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                 });
               }
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
            (payload) => {
                setMatchData(prev => ({
                    ...prev,
                    current_price: payload.new.current_price,
                    status: payload.new.status
                }));
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChat();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [matchId]);

  // --- ЛОГИКА ПОКУПАТЕЛЯ ---
  const handleOffer = async (price) => {
    // 1. Отправляем сообщение
    await supabase.from('messages').insert([{ 
        match_id: matchId, 
        sender: 'buyer', 
        text: 'Предлагаю цену:', 
        price: price 
    }]);
    // 2. Обновляем цену в сделке
    await supabase.from('matches').update({ current_price: price }).eq('id', matchId);
  };

  const handleBuy = async () => {
    await supabase.from('messages').insert([{ match_id: matchId, sender: 'buyer', text: 'Я готов купить!' }]);
    alert('Имитация перехода к оплате...');
  };

  // --- ЛОГИКА ПРОДАВЦА ---
  const handleAccept = async () => {
      // 1. Меняем статус
      await supabase.from('matches').update({ status: 'agreed' }).eq('id', matchId);
      // 2. Системное сообщение
      await supabase.from('messages').insert([{ 
          match_id: matchId, 
          sender: 'system', 
          text: '✅ Продавец принял предложение! Сделка закрыта.' 
      }]);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Загрузка...</div>;
  if (!matchData) return <div className="h-screen bg-black text-white p-4">Ошибка доступа</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Шапка */}
      <div className="flex items-center p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-30">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-800 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="ml-3 flex items-center gap-3">
          <img 
            src={matchData.products.image} 
            className="w-10 h-10 rounded-full object-cover border border-gray-600" 
          />
<div>
                <h1 className="font-bold text-sm">{matchData.products.title}</h1>
                <p className={`text-xs ${matchData.status === 'agreed' ? 'text-green-500 font-bold' : 'text-blue-400'}`}>
                   {/* Меняем ₽ на ₴ */}
                   {matchData.status === 'agreed' ? 'Сделка закрыта' : `Торг: ${matchData.current_price.toLocaleString('uk-UA')} ₴`}
                </p>
            </div>
                    </div>
        
        {/* Индикатор роли */}
        <div className="ml-auto flex flex-col items-end text-[8px] text-gray-500 font-mono">
            <span className={`px-2 py-1 rounded border mb-1 font-bold ${isSeller ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-blue-500 text-blue-400 bg-blue-900/20'}`}>
                {isSeller ? 'ВЫ: ПРОДАВЕЦ' : 'ВЫ: ПОКУПАТЕЛЬ'}
            </span>
        </div>
      </div>

      {/* Список сообщений с передачей роли isSeller */}
      <MessageList messages={messages} isSeller={isSeller} />

      {/* Панель управления */}
      <TradePanel 
        currentPrice={matchData.current_price} 
        onOffer={handleOffer} 
        onBuy={handleBuy}
        onAccept={handleAccept}
        isSeller={isSeller} 
        status={matchData.status} 
      />
    </div>
  );
}