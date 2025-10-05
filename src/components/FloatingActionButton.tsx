import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingActionButton = ({ onClick, className }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-balloon hover:shadow-lg",
        "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "z-50 lg:hidden",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
        right: "calc(1rem + env(safe-area-inset-right))",
      }}
      aria-label="Ajouter une tâche"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  );
};
