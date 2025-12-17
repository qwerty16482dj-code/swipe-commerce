import React, { useState } from 'react'; // 1. Импортируем useState
import useGestures from '../../hooks/useGestures';

// Принимаем новый пропс onExpand
const Card = ({ product, onLike, onDislike, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false); // 2. Состояние раскрытия

  const { handlers, style, likeOpacity, nopeOpacity } = useGestures({
    onSwipeLeft: onDislike,
    onSwipeRight: onLike
  });

  const handleReadMore = (e) => {
    e.stopPropagation(); // Важно: чтобы клик не считался началом свайпа
    setIsExpanded(true);
    if (onExpand) onExpand(); // Вызываем сигнал для родителя
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <div 
        {...handlers} 
        style={style}
        className="relative w-full max-w-md h-[65vh] bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/10 select-none touch-none will-change-transform cursor-grab active:cursor-grabbing"
      >
        <img
          src={product.image}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable="false"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

        <div style={{ opacity: likeOpacity }} className="absolute top-10 left-8 border-[6px] border-green-400 text-green-400 font-extrabold text-5xl px-4 py-2 rounded-xl transform -rotate-12 z-20 tracking-widest shadow-lg backdrop-blur-sm pointer-events-none">
          LIKE
        </div>
        <div style={{ opacity: nopeOpacity }} className="absolute top-10 right-8 border-[6px] border-red-500 text-red-500 font-extrabold text-5xl px-4 py-2 rounded-xl transform rotate-12 z-20 tracking-widest shadow-lg backdrop-blur-sm pointer-events-none">
          NOPE
        </div>

        {/* Контейнер с информацией. Убрали глобальный pointer-events-none, 
            чтобы кнопка внутри работала */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
          <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-white/20 backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide uppercase">{product.category || 'New'}</span>
          </div>

          <h2 className="text-3xl font-bold leading-tight drop-shadow-lg mb-2 pointer-events-none">
            {product.title}
          </h2>
          
          <div className="flex flex-col mt-4">
             {/* Описание с условным классом line-clamp */}
             <p className={`text-sm text-gray-300 leading-relaxed opacity-90 pr-16 transition-all duration-300 pointer-events-none ${isExpanded ? '' : 'line-clamp-2'}`}>
                {product.description}
             </p>
             
             {/* Кнопка "Читать далее" */}
             {!isExpanded && (
               <button 
                 onClick={handleReadMore}
                 // pointer-events-auto включаем клики только для этой кнопки
                 className="text-green-400 text-sm font-bold mt-1 self-start pointer-events-auto active:scale-95 transition-transform"
               >
                 Читать далее
               </button>
             )}

<div className="flex justify-end mt-2 pointer-events-none">
                <span className="text-3xl font-bold text-white tracking-tight">
                  {/* Заменили ru-RU на uk-UA и значок */}
                  {product.price.toLocaleString('uk-UA')} ₴
                </span>
             </div>
                       </div>
        </div>
      </div>
    </div>
  );
};

export default Card;