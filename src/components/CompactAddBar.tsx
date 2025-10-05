import { forwardRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactAddBarProps {
  onAdd: () => void;
  visible: boolean;
  className?: string;
}

export const CompactAddBar = forwardRef<HTMLButtonElement, CompactAddBarProps>(
  ({ onAdd, visible, className }, ref) => {
    const handleClick = () => {
      // Trigger the onAdd callback which opens the creation dialog
      onAdd();
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          "flex gap-1.5 items-center justify-center w-full transition-all duration-300 px-3 py-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 cursor-pointer h-9",
          !visible && "opacity-0 h-0 overflow-hidden pointer-events-none",
          className
        )}
        data-testid="composer-compact"
      >
        <Plus className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-xs text-slate-500" style={{ fontSize: '12px' }}>
          Nouvelle tâche
        </span>
      </button>
    );
  }
);

CompactAddBar.displayName = 'CompactAddBar';
