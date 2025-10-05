import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface FloatingActionButtonProps {
  onClick: () => void;
  visible?: boolean;
  className?: string;
}

export const FloatingActionButton = ({ onClick, visible = true, className }: FloatingActionButtonProps) => {
  const scrollDirection = useScrollDirection(15);
  
  // FAB visible only when scrolling down (or initial state) AND when parent says it's visible
  const shouldShow = visible && scrollDirection !== 'up';

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-balloon hover:shadow-lg",
        "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
        "transition-all duration-500 ease-out hover:scale-110 active:scale-95",
        "z-50 lg:hidden",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        !shouldShow && "opacity-0 scale-90 pointer-events-none",
        className
      )}
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
        right: "calc(1rem + env(safe-area-inset-right))",
      }}
      aria-label="Ajouter une tâche"
      aria-hidden={!shouldShow}
      data-testid="fab-add"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  );
};
