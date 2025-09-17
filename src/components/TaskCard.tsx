import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
}

export const TaskCard = ({ task, onToggle }: TaskCardProps) => {
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

  return (
    <Card className={cn(
      "p-4 transition-all duration-300 ease-in-out shadow-card hover:shadow-vibrant",
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
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium leading-relaxed transition-all duration-200",
            task.completed ? "text-success-foreground line-through" : "text-card-foreground"
          )}>
            {task.title}
          </p>
          <div className="flex justify-between items-center mt-2 text-xs">
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