import React from 'react';

const TradePanel = ({ currentPrice, onOffer, onBuy, onAccept, isSeller, status }) => {
  // 1. Если сделка закрыта
  if (status === 'agreed') {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
        <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/50 p-4 rounded-3xl text-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <p className="text-green-400 font-extrabold text-xl flex items-center justify-center gap-2">
                🎉 Сделка заключена!
            </p>
            <p className="text-green-600/70 text-xs mt-1 font-bold uppercase tracking-wider">
                Товар забронирован
            </p>
        </div>
      </div>
    );
  }

  // 2. Интерфейс ПРОДАВЦА
  if (isSeller) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 z-50">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/90 to-transparent pointer-events-none" />
        
        <div className="relative max-w-md mx-auto flex flex-col gap-4 text-center p-4 rounded-3xl border border-white/5 bg-gray-900/50 backdrop-blur-xl shadow-2xl">
          <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                Текущее предложение
              </p>
              <span className="text-white font-mono font-bold text-3xl tracking-tighter">
                {currentPrice.toLocaleString('uk-UA')} ₴
              </span>
          </div>

          <button 
            onClick={onAccept}
            className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-extrabold text-lg rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
          >
            Принять предложение
          </button>
          
          <div className="text-[10px] text-gray-500 font-mono">
            Нажмите, чтобы завершить торги и продать товар
          </div>
        </div>
      </div>
    );
  }

  // 3. Интерфейс ПОКУПАТЕЛЯ
  // Рассчитываем скидки
  const step1 = Math.floor(currentPrice * 0.9); // -10%
  const step2 = Math.floor(currentPrice * 0.95); // -5%

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 z-50">
      {/* Градиентная подложка, чтобы текст не сливался с фоном */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      
      <div className="relative max-w-md mx-auto flex flex-col gap-3">
        {/* Кнопки скидок */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onOffer(step1)}
            className="group relative flex flex-col items-center justify-center py-4 bg-gray-800/40 hover:bg-gray-700/60 border border-white/5 hover:border-white/20 rounded-2xl active:scale-95 transition-all backdrop-blur-md"
          >
            <span className="text-xl font-bold text-white group-hover:text-blue-400 font-mono tracking-tight transition-colors">
              {step1.toLocaleString('uk-UA')} ₴
            </span>
            <span className="text-[10px] uppercase font-bold text-blue-500/70 group-hover:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded mt-1 transition-colors">
              -10% Скидка
            </span>
          </button>
          
          <button 
            onClick={() => onOffer(step2)}
            className="group relative flex flex-col items-center justify-center py-4 bg-gray-800/40 hover:bg-gray-700/60 border border-white/5 hover:border-white/20 rounded-2xl active:scale-95 transition-all backdrop-blur-md"
          >
            <span className="text-xl font-bold text-white group-hover:text-blue-400 font-mono tracking-tight transition-colors">
              {step2.toLocaleString('uk-UA')} ₴
            </span>
            <span className="text-[10px] uppercase font-bold text-blue-500/70 group-hover:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded mt-1 transition-colors">
              -5% Скидка
            </span>
          </button>
        </div>

        {/* Главная кнопка Купить */}
        <button 
          onClick={onBuy}
          className="w-full py-4 bg-white hover:bg-gray-100 text-black font-extrabold text-lg rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Купить за {currentPrice.toLocaleString('uk-UA')} ₴
        </button>
      </div>
    </div>
  );
};

export default TradePanel;