'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ChevronLeft, Sparkles, Image as ImageIcon, Check } from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: 'Tech', image: '',
    isDark: false, isVivid: false, isWarm: false
  });

  const categoryVectors = {
    'Tech': [0.9, 0.1, 0.1, 0.2, 0.0],
    'Look': [0.0, 0.9, 0.0, 0.2, 0.0],
    'Home': [0.1, 0.2, 0.9, 0.0, 0.1],
    'Play': [0.2, 0.1, 0.0, 0.9, 0.0],
    'Care': [0.0, 0.1, 0.2, 0.0, 0.9]
  };

  useEffect(() => {
    const textToCheck = (formData.title + ' ' + formData.image).toLowerCase();
    const keywords = {
        'Tech': ['iphone', 'macbook', 'samsung', 'xiaomi', 'laptop', 'dji', 'camera', 'sony', 'android', 'телефон', 'ноутбук'],
        'Look': ['nike', 'adidas', 'zara', 'dress', 'jeans', 'watch', 'ring', 'bag', 'gucci', 'платье', 'кроссовки'],
        'Home': ['sofa', 'chair', 'table', 'lamp', 'ikea', 'bosch', 'drill', 'bed', 'диван', 'стул', 'стол', 'лампа'],
        'Play': ['ps5', 'xbox', 'nintendo', 'game', 'guitar', 'lego', 'snowboard', 'bike', 'велосипед', 'гитара'],
        'Care': ['cat', 'dog', 'baby', 'food', 'royal', 'diaper', 'food', 'кошка', 'собака', 'корм']
    };
    for (const [cat, words] of Object.entries(keywords)) {
        if (words.some(word => textToCheck.includes(word))) {
            setFormData(prev => ({ ...prev, category: cat }));
            break;
        }
    }
  }, [formData.title, formData.image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Войдите в аккаунт!"); setLoading(false); return; }

    const baseVec = categoryVectors[formData.category] || [0,0,0,0,0];
    const styleVec = [formData.isDark ? 0.9 : 0.0, formData.isVivid ? 0.9 : 0.0, formData.isWarm ? 0.9 : 0.0];
    const embedding = JSON.stringify([...baseVec, ...styleVec]);

    const { error } = await supabase.from('products').insert([{
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category, 
        image: formData.image || 'https://via.placeholder.com/400x500',
        embedding: embedding,
        owner_id: user.id
    }]);

    if (!error) router.push('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Шапка */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition">
          <ChevronLeft />
        </button>
        <span className="font-bold text-lg">Новое объявление</span>
        <div className="w-8" />
      </div>

      <div className="p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            
            {/* Блок 1: Фото */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Фотография</label>
                <div className={`relative h-56 w-full rounded-2xl overflow-hidden border-2 border-dashed ${formData.image ? 'border-transparent' : 'border-gray-700 bg-gray-900'} transition-all flex items-center justify-center group`}>
                    {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <div className="text-center text-gray-500 group-hover:text-white transition">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <span className="text-sm">Вставьте ссылку</span>
                        </div>
                    )}
                </div>
                <input 
                    type="url" required placeholder="https://..." 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                    value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                />
            </div>

            {/* Блок 2: Основное */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Название</label>
                    <input 
                        type="text" required placeholder="iPhone 15"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 font-bold text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>
<div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Цена ₴</label>
                    <input 
                        type="text"             // Меняем number на text, чтобы убрать системные стили
                        inputMode="numeric"     // На мобильных откроется цифровая клавиатура
                        required 
                        placeholder="0"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 font-bold font-mono text-white focus:border-green-500 outline-none transition-all placeholder:text-gray-600"
                        value={formData.price} 
                        onChange={(e) => {
                            // Магия: разрешаем вводить ТОЛЬКО цифры
                            const val = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, price: val});
                        }}
                    />
                </div>
                                            </div>

            {/* Блок 3: Категория */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Категория</label>
                    {/* Бейдж авто-выбора */}
                    <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                        <Sparkles size={10} />
                        Auto-Select
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {Object.keys(categoryVectors).map(cat => (
                        <button key={cat} type="button" onClick={() => setFormData({...formData, category: cat})}
                            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all active:scale-95 border
                                ${formData.category === cat 
                                    ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Блок 4: Описание */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Детали</label>
                <textarea rows={4} placeholder="Опишите состояние, комплектность и причину продажи..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none resize-none placeholder:text-gray-600"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            {/* Кнопка (В ПОТОКЕ, НЕ ПЕРЕКРЫВАЕТ) */}
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4 mt-8 bg-green-500 hover:bg-green-400 text-black font-extrabold text-lg rounded-2xl shadow-xl shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {loading ? 'Публикация...' : (
                    <>
                        <Check size={20} /> Разместить
                    </>
                )}
            </button>
            
            {/* Отступ снизу для комфортного скролла */}
            <div className="h-8" />
        </form>
      </div>
    </div>
  );
}