import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";

export type Priority = "low" | "medium" | "high";

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  subTasks?: SubTask[];
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onSubTaskToggle: (taskId: string, subTaskId: string) => void;
}

export const TaskCard = ({ task, onToggle, onEdit, onSubTaskToggle }: TaskCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: task.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    if (!task.completed) {
      setIsCompleting(true);
      setShowCelebration(true);
      setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          onToggle(task.id);
          setIsAnimating(false);
          setIsCompleting(false);
          setTimeout(() => setShowCelebration(false), 500);
        }, 300);
      }, 1200);
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        onToggle(task.id);
        setIsAnimating(false);
      }, 300);
    }
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
      case "high": return "bg-gradient-to-r from-red-400/20 to-orange-400/20 text-red-600 border-red-400/40";
      case "medium": return "bg-gradient-to-r from-purple-400/20 to-pink-400/20 text-purple-600 border-purple-400/40";
      case "low": return "bg-gradient-to-r from-green-400/20 to-teal-400/20 text-green-600 border-green-400/40";
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
    <div className="relative">
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          "p-4 transition-all duration-300 ease-in-out shadow-card hover:shadow-vibrant",
          "bg-gradient-card border-border/50",
          isAnimating && "scale-95 opacity-75",
          isCompleting && "animate-confetti-explosion",
          task.completed && "bg-gradient-success shadow-success",
          isDragging && "opacity-50 scale-95 z-50"
        )}
      >
        {showCelebration && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="celebration-text bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              🎉 Bravo! 🎉
            </div>
          </div>
        )}
      <div className="flex items-start gap-3">
        <div 
          className="cursor-grab active:cursor-grabbing mt-1 opacity-40 hover:opacity-80 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          className={cn(
            "mt-1 data-[state=checked]:bg-success data-[state=checked]:border-success transition-all duration-300",
            isCompleting && "animate-checkmark"
          )}
        />
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(task)}>
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

          {task.subTasks && task.subTasks.length > 0 && (
            <div className="mb-3 space-y-1">
              {task.subTasks.map((subTask) => (
                <div key={subTask.id} className="flex items-center gap-2 py-1">
                  <Checkbox
                    checked={subTask.completed}
                    onCheckedChange={() => onSubTaskToggle(task.id, subTask.id)}
                    className="h-3 w-3 data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <span className={cn(
                    "text-xs flex-1",
                    subTask.completed 
                      ? "text-success-foreground line-through opacity-70" 
                      : "text-muted-foreground"
                  )}>
                    {subTask.text}
                  </span>
                </div>
              ))}
            </div>
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
    </div>
  );
};