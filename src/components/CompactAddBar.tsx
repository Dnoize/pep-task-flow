import { useState, useRef, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactAddBarProps {
  onAdd: (title: string) => void;
  visible: boolean;
  className?: string;
}

export const CompactAddBar = forwardRef<HTMLInputElement, CompactAddBarProps>(
  ({ onAdd, visible, className }, ref) => {
    const [title, setTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (title.trim()) {
        onAdd(title.trim());
        setTitle('');
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex gap-2 items-center transition-all duration-300",
          !visible && "opacity-0 h-0 overflow-hidden",
          className
        )}
        data-testid="composer-compact"
      >
        <Input
          ref={ref}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="🎈 Ajout rapide..."
          className="flex-1 h-10 text-sm rounded-xl"
          style={{ fontSize: '16px' }}
          data-testid="composer-compact-input"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim()}
          className="h-10 w-10 p-0 rounded-xl"
          data-testid="composer-compact-add"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    );
  }
);

CompactAddBar.displayName = 'CompactAddBar';
