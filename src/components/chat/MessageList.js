import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, isSeller }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 scrollbar-hide">
      {messages.map((msg, index) => {
        const isSystem = msg.sender === 'system';
        
        // Логика: Моё сообщение или чужое?
        const isMe = !isSystem && (
            (msg.sender === 'buyer' && !isSeller) || 
            (msg.sender === 'seller' && isSeller)
        );

        return (
          <div 
            key={msg.id || index} 
            className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div 
              className={`relative max-w-[85%] px-5 py-3 text-[15px] shadow-md
                ${isMe 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                  : isSystem
                    ? 'bg-green-900/20 text-green-400 text-sm text-center border border-green-500/30 rounded-xl mx-auto py-2' // Системные (Зеленый акцент)
                    : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-2xl rounded-tl-sm'
                }`}
            >
              {/* МЫ УБРАЛИ НАДПИСЬ SYSTEM ЗДЕСЬ */}
              
              <span className="leading-relaxed">{msg.text}</span>

{msg.price && (
                <div className={`mt-2 pt-2 border-t ${isMe ? 'border-white/20' : 'border-gray-600'}`}>
                  <span className="text-xl font-bold tracking-tight">
                    {/* Меняем тут */}
                    {msg.price.toLocaleString('uk-UA')} ₴
                  </span>
                </div>
              )}
                          </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;