import { useEffect, useState } from "react";

interface BalloonBurstProps {
  show: boolean;
  onComplete?: () => void;
}

export const BalloonBurst = ({ show, onComplete }: BalloonBurstProps) => {
  const [balloons, setBalloons] = useState<Array<{ id: number; delay: number; color: string; left: string }>>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (show && !prefersReducedMotion) {
      const colors = ['#60A5FA', '#34D399', '#FB7185', '#FACC15'];
      const newBalloons = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        delay: Math.random() * 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: `${20 + Math.random() * 60}%`,
      }));
      
      setBalloons(newBalloons);
      
      const timer = setTimeout(() => {
        setBalloons([]);
        onComplete?.();
      }, 650);
      
      return () => clearTimeout(timer);
    } else if (show) {
      // If reduced motion, complete immediately
      onComplete?.();
    }
  }, [show, prefersReducedMotion, onComplete]);

  if (!show || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className="absolute balloon-rise"
          style={{
            left: balloon.left,
            bottom: '10%',
            animationDelay: `${balloon.delay}ms`,
          }}
        >
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
            <ellipse cx="20" cy="20" rx="18" ry="22" fill={balloon.color} opacity="0.9" />
            <path d="M20 42 Q18 46, 20 50" stroke={balloon.color} strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  );
};
