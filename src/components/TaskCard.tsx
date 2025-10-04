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
import { BalloonBurst } from "./BalloonBurst";

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
  const [showBalloons, setShowBalloons] = useState(false);

  const playBalloonSounds = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Balloon inflate sound
    const inflateSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgoSGiIqMjpCSlJaYmpyeoKKkpqiqrK6wsrS2uLq8vsDCxMbIyMzO0NLU1tjY2tze4OLi5Obm6Orq7O7u8PLy9Pb2+Pr6/Pz+/v7+/v7+/v7+/Pz6+vj49vb09PLy8O7u7Orq6Ojm5uTi4uDe3Nra2NjW1NTS0M7MzMjIxsTE');
    inflateSound.volume = 0.3;
    inflateSound.play().catch(() => {});

    // Balloon pop sound after 400ms
    setTimeout(() => {
      const popSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAABAAgAZGF0YQAAAAA=');
      popSound.volume = 0.4;
      popSound.play().catch(() => {});
    }, 400);
  };
  
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
      setShowBalloons(true);
      playBalloonSounds();
      setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          onToggle(task.id);
          setIsAnimating(false);
          setIsCompleting(false);
          setTimeout(() => {
            setShowCelebration(false);
            setShowBalloons(false);
          }, 500);
        }, 300);
      }, 600);
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
      case "high": return "balloon-chip balloon-chip-high";
      case "medium": return "balloon-chip balloon-chip-medium";
      case "low": return "balloon-chip balloon-chip-low";
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
      <BalloonBurst show={showBalloons} onComplete={() => setShowBalloons(false)} />
      
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          "p-4 transition-all duration-300 ease-in-out shadow-card hover:shadow-balloon rounded-2xl",
          "bg-gradient-card border-border/50",
          isAnimating && "scale-95 opacity-75",
          isCompleting && "animate-confetti-explosion",
          task.completed && "bg-gradient-success shadow-success",
          isDragging && "opacity-50 scale-95 z-50"
        )}
      >
        {showCelebration && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="celebration-text bg-gradient-to-r from-primary to-success text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              🎈 Bravo! 🎈
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
              "shrink-0",
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
            <div className="mb-3 space-y-2 p-2 bg-muted/30 rounded-md border border-border/50">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Sous-tâches ({task.subTasks.filter(st => st.completed).length}/{task.subTasks.length})
              </div>
              {task.subTasks.map((subTask) => (
                <div key={subTask.id} className="flex items-center gap-2 py-1 group">
                  <Checkbox
                    checked={subTask.completed}
                    onCheckedChange={() => onSubTaskToggle(task.id, subTask.id)}
                    className="h-3 w-3 data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <span className={cn(
                    "text-xs flex-1 cursor-pointer",
                    subTask.completed 
                      ? "text-success line-through opacity-70" 
                      : "text-card-foreground hover:text-primary transition-colors"
                  )}>
                    {subTask.text}
                  </span>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center transition-colors">
                    {subTask.completed ? (
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 border border-muted-foreground/30 rounded-full group-hover:border-primary/50"></div>
                    )}
                  </div>
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