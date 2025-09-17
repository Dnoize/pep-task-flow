import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
    }
  };

  return (
    <Card className="p-4 mb-6 bg-gradient-card shadow-card border-border/50">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
          className="flex-1 border-input bg-background/50 focus:ring-primary focus:border-primary"
        />
        <Button 
          type="submit" 
          className="bg-gradient-primary text-primary-foreground shadow-vibrant hover:shadow-lg transition-all duration-200"
          disabled={!title.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};