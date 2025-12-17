'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { LogOut, User, ChevronLeft, ArrowRight, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        setLoadingUser(false);
    }
    checkUser();
  }, []);

  const handleLogout = async () => {
      setLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    if (!email || !password) {
        setMsg('Заполните все поля');
        setLoading(false);
        return;
    }
    try {
        let error;
        if (isLoginMode) {
            const res = await supabase.auth.signInWithPassword({ email, password });
            error = res.error;
        } else {
            const res = await supabase.auth.signUp({ email, password });
            error = res.error;
        }
        if (error) throw error;
        if (!isLoginMode) await supabase.auth.signInWithPassword({ email, password });
        
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        setTimeout(() => router.push('/'), 500);
    } catch (err) {
        setMsg(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (loadingUser) return <div className="min-h-screen bg-black flex items-center justify-center text-white/50 animate-pulse">Загрузка профиля...</div>;

  // === ПРОФИЛЬ ===
  if (currentUser) {
      return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
            {/* Фоновые пятна */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

            <div className="w-full max-w-sm relative z-10">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] text-center shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                        <User size={40} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Ваш Профиль</h1>
                    <p className="text-gray-400 text-sm mb-8 font-mono bg-black/20 py-2 rounded-lg truncate px-4">
                        {currentUser.email}
                    </p>
                    <div className="space-y-3">
                        <button onClick={() => router.push('/')} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all">
                            В магазин
                        </button>
                        <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-400 font-bold py-4 rounded-2xl border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                            {loading ? '...' : <><LogOut size={18} /> Выйти</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // === ВХОД / РЕГИСТРАЦИЯ ===
  return (
    <div className="min-h-screen relative flex flex-col justify-center p-6 overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
      
      <button onClick={() => router.back()} className="absolute top-6 left-6 p-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 active:scale-90 transition z-50">
          <ChevronLeft />
      </button>

      <div className="w-full max-w-sm mx-auto relative z-10">
        <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">
                {isLoginMode ? 'С возвращением' : 'Создать аккаунт'}
            </h1>
            <p className="text-gray-400">
                {isLoginMode ? 'Введите данные для входа' : 'Присоединяйтесь к торговле будущего'}
            </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-4">
            <div className="relative group">
                <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition" size={20} />
                <input 
                  type="email" required placeholder="Email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div className="relative group">
                <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition" size={20} />
                <input 
                  type="password" required placeholder="Пароль"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
            </div>
          </div>

          {msg && (
            <div className={`text-xs text-center p-3 rounded-xl ${msg.includes('Ошибка') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                {msg}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? 'Ждем...' : <>{isLoginMode ? 'Войти' : 'Создать'} <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => { setIsLoginMode(!isLoginMode); setMsg(''); }} className="text-sm text-gray-400 hover:text-white transition">
            {isLoginMode ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <span className="text-blue-400 font-bold">{isLoginMode ? 'Регистрация' : 'Вход'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}