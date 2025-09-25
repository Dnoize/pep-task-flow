import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Priority } from "./TaskCard";

interface AddTaskFormProps {
  onAdd: (title: string, description?: string, priority?: Priority) => void;
}

export const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), description.trim() || undefined, priority);
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
  };

  return (
    <Card className="p-4 mb-6 bg-gradient-card shadow-card border-border/50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ajouter une nouvelle tâche..."
            className="flex-1 border-input bg-background/50 focus:ring-primary focus:border-primary"
          />
        <Button 
          type="submit" 
          disabled={!title.trim()}
          className="bg-gradient-to-r from-info to-accent hover:from-info/90 hover:to-accent/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label htmlFor="description" className="text-xs text-muted-foreground">Notes (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter des notes..."
              className="mt-1 min-h-[60px] text-sm"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="priority" className="text-xs text-muted-foreground">Priorité</Label>
            <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Normal</SelectItem>
                <SelectItem value="high">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </Card>
  );
};