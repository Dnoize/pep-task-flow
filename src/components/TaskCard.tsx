import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard = ({ task, onToggle, onEdit }: TaskCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggle(task.id);
      setIsAnimating(false);
    }, 300);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high": return "bg-destructive/20 text-destructive border-destructive/30";
      case "medium": return "bg-warning/20 text-warning border-warning/30";
      case "low": return "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30";
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case "high": return "Urgent";
      case "medium": return "Normal";
      case "low": return "Faible";
    }
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-300 ease-in-out shadow-card hover:shadow-vibrant cursor-pointer",
      "bg-gradient-card border-border/50",
      isAnimating && "scale-95 opacity-75",
      task.completed && "bg-gradient-success shadow-success"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          className="mt-1 data-[state=checked]:bg-success data-[state=checked]:border-success"
        />
        <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={cn(
              "text-sm font-medium leading-relaxed transition-all duration-200",
              task.completed ? "text-success-foreground line-through" : "text-card-foreground"
            )}>
              {task.title}
            </p>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border shrink-0",
              getPriorityColor(task.priority)
            )}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>
          
          {task.description && (
            <p className={cn(
              "text-xs text-muted-foreground mb-2 line-clamp-2",
              task.completed && "line-through"
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex justify-between items-center text-xs">
            <span className={cn(
              "px-2 py-1 rounded-full",
              task.completed 
                ? "bg-success/20 text-success-foreground" 
                : "bg-primary/20 text-primary"
            )}>
              Créé: {formatDate(task.createdAt)}
            </span>
            {task.completedAt && (
              <span className="px-2 py-1 rounded-full bg-success/20 text-success-foreground">
                Terminé: {formatDate(task.completedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};