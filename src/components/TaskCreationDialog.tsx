import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Priority } from "./TaskCard";
import { cn } from "@/lib/utils";

interface TaskCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, description?: string, priority?: Priority) => void;
}

export const TaskCreationDialog = ({ open, onClose, onAdd }: TaskCreationDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), description.trim() || undefined, priority);
      setTitle("");
      setDescription("");
      setPriority("medium");
      onClose();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[100dvh] overflow-y-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">🎈 Créer une tâche</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-[15px] font-medium">
              Titre
            </Label>
            <Input
              ref={titleInputRef}
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleFocus}
              placeholder="Que voulez-vous accomplir ?"
              className="text-base h-12"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-[15px] font-medium">
              Description (optionnel)
            </Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={handleFocus}
              placeholder="Ajouter des détails..."
              className="text-base min-h-[120px]"
              style={{ fontSize: '16px' }}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[15px] font-medium">Priorité</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority("low")}
                className={cn(
                  "py-3 px-3 rounded-xl border-2 transition-all text-sm font-medium min-h-[44px]",
                  priority === "low"
                    ? "bg-muted border-muted-foreground/40 text-muted-foreground"
                    : "bg-background border-border text-muted-foreground/60"
                )}
              >
                Faible
              </button>
              <button
                type="button"
                onClick={() => setPriority("medium")}
                className={cn(
                  "py-3 px-3 rounded-xl border-2 transition-all text-sm font-medium min-h-[44px]",
                  priority === "medium"
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground/60"
                )}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority("high")}
                className={cn(
                  "py-3 px-3 rounded-xl border-2 transition-all text-sm font-medium min-h-[44px]",
                  priority === "high"
                    ? "bg-accent/10 border-accent/40 text-accent"
                    : "bg-background border-border text-muted-foreground/60"
                )}
              >
                Urgent
              </button>
            </div>
          </div>

          <div 
            className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-2"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-base"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-accent"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
