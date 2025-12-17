import { useState, useRef, useEffect } from 'react';

export default function useGestures({ onSwipeLeft, onSwipeRight }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    startPos.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const newX = clientX - startPos.current.x;
    const newY = clientY - startPos.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
    const threshold = 100;

    if (position.x > threshold) {
      // Свайп ВПРАВО
      finishSwipe(1000, 0, onSwipeRight); 
    } else if (position.x < -threshold) {
      // Свайп ВЛЕВО
      finishSwipe(-1000, 0, onSwipeLeft); 
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const finishSwipe = (targetX, targetY, callback) => {
    setPosition({ x: targetX, y: targetY });
    setTimeout(() => {
      // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем, что callback существует и является функцией
      if (typeof callback === 'function') {
        callback();
      }
      setTimeout(() => setPosition({ x: 0, y: 0 }), 100); 
    }, 300);
  };

  const handlers = {
    onMouseDown: (e) => handleStart(e.clientX, e.clientY),
    onTouchStart: (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY),
  };

  useEffect(() => {
    const onMove = (e) => handleMove(e.clientX || e.touches?.[0].clientX, e.clientY || e.touches?.[0].clientY);
    const onUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, position]);

  const rotation = position.x * 0.05; 
  const likeOpacity = Math.max(0, position.x / 100);
  const nopeOpacity = Math.max(0, -position.x / 100);

  return {
    handlers,
    style: {
      transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      cursor: isDragging ? 'grabbing' : 'grab',
    },
    likeOpacity,
    nopeOpacity
  };
}