'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function MatchesPage() {
  const router = useRouter();
  const [buying, setBuying] = useState([]);
  const [selling, setSelling] = useState([]);
  const [activeTab, setActiveTab] = useState('selling'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      const { data: { user } } = await supabase.auth.getUser();
      const myId = user?.id; 

      const { data: matches } = await supabase.from('matches')
        .select(`id, status, current_price, buyer_id, products (title, image, owner_id)`)
        .order('created_at', { ascending: false }); // Свежие сверху

      if (matches) {
        const myBuys = [];
        const mySales = [];
        matches.forEach(match => {
          if (match.buyer_id === myId) myBuys.push(match);
          else if (match.products.owner_id === myId) mySales.push(match);
        });
        setBuying(myBuys);
        setSelling(mySales);
      }
      setLoading(false);
    }
    fetchMatches();
  }, []);

  const List = ({ items, isSelling }) => (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {items.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-2xl">📭</div>
            <p>Здесь пока пусто</p>
        </div>
      ) : (
        items.map(match => (
          <div key={match.id} onClick={() => router.push(`/chat/${match.id}`)}
            className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 pr-5 rounded-2xl border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="relative">
                <img src={match.products.image} className="w-16 h-16 rounded-xl object-cover bg-gray-800" />
                {match.status === 'agreed' && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">SOLD</div>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-white truncate pr-2">{match.products.title}</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">Сегодня</span>
              </div>
              <p className="text-sm text-gray-400 truncate flex items-center gap-1.5">
                 {isSelling ? <ArrowDownLeft size={14} className="text-green-400"/> : <ArrowUpRight size={14} className="text-blue-400"/>}
                 {isSelling ? 'Вам предложили:' : 'Ваше предложение:'}
              </p>
            </div>

<div className={`text-right ${match.status === 'agreed' ? 'opacity-50' : ''}`}>
               <span className="block font-bold text-white text-lg">{match.current_price.toLocaleString('uk-UA')}</span>
               {/* Меняем RUB на UAH */}
               <span className="text-[10px] text-gray-500 uppercase font-bold">UAH</span>
            </div>
                      </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <div className="flex items-center justify-between mb-6 pt-2">
        <button onClick={() => router.push('/')} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition">
          <ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">Сообщения</h1>
        <div className="w-10"/> 
      </div>

      {/* Переключатель Табов */}
      <div className="bg-white/5 p-1.5 rounded-2xl mb-6 grid grid-cols-2 relative">
        <button onClick={() => setActiveTab('selling')} className={`py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === 'selling' ? 'text-white' : 'text-gray-500'}`}>
            Продаю <span className="ml-1 opacity-60 text-xs">{selling.length}</span>
        </button>
        <button onClick={() => setActiveTab('buying')} className={`py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === 'buying' ? 'text-white' : 'text-gray-500'}`}>
            Покупаю <span className="ml-1 opacity-60 text-xs">{buying.length}</span>
        </button>
        
        {/* Анимированный фон (Sliding Pill) */}
        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gray-800 rounded-xl shadow-lg transition-all duration-300 ${activeTab === 'selling' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />
      </div>

      {loading ? <div className="text-center mt-20 text-gray-500 animate-pulse">Загрузка...</div> : 
        <List items={activeTab === 'selling' ? selling : buying} isSelling={activeTab === 'selling'} />
      }
    </div>
  );
}