import { useState, useRef, TouchEvent } from "react";

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight }: SwipeCallbacks) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping.current) return;
    
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    
    // Limit swipe distance
    const limitedDiff = Math.max(-150, Math.min(150, diff));
    setSwipeOffset(limitedDiff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    
    const diff = touchCurrentX.current - touchStartX.current;
    const threshold = 80;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset
    setSwipeOffset(0);
    isSwiping.current = false;
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  };

  return {
    swipeOffset,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
