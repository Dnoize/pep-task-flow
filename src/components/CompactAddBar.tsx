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
          "flex gap-2 items-center w-full transition-all duration-300 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 active:bg-muted cursor-pointer min-h-[44px]",
          !visible && "opacity-0 h-0 overflow-hidden pointer-events-none",
          className
        )}
        data-testid="composer-compact"
      >
        <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground text-left flex-1" style={{ fontSize: '16px' }}>
          🎈 Ajout rapide...
        </span>
      </button>
    );
  }
);

CompactAddBar.displayName = 'CompactAddBar';
