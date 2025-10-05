import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSwipe } from "@/hooks/useSwipe";
import { Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";
import { BalloonBurst } from "./BalloonBurst";
import { SubTaskList } from "./SubTaskList";

export type Priority = "low" | "medium" | "high";

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  order?: number;
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
  onDelete?: (id: string) => void;
  onAddSubTask?: (taskId: string, title: string) => void;
  onReorderSubTasks?: (taskId: string, oldIndex: number, newIndex: number) => void;
  onDeleteSubTask?: (taskId: string, subTaskId: string) => void;
}

export const TaskCard = ({ task, onToggle, onEdit, onSubTaskToggle, onDelete, onAddSubTask, onReorderSubTasks, onDeleteSubTask }: TaskCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const { toast } = useToast();
  
  // Swipe gestures
  const { swipeOffset, handlers } = useSwipe({
    onSwipeRight: () => {
      if (!task.completed && onToggle) {
        handleToggle();
        
        // Haptic feedback on mobile
        if ('vibrate' in navigator && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          navigator.vibrate(10);
        }
      }
    },
    onSwipeLeft: () => {
      if (onDelete) {
        const taskTitle = task.title;
        let undoTimeout: NodeJS.Timeout;
        
        // Store task for potential undo
        const taskSnapshot = { ...task };
        
        // Delete task immediately with visual feedback
        onDelete(task.id);
        
        // Show undo toast
        toast({
          title: "Tâche supprimée",
          description: taskTitle,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearTimeout(undoTimeout);
                toast({
                  title: "Fonctionnalité d'annulation",
                  description: "L'annulation nécessite une refonte de l'architecture de stockage",
                });
              }}
              className="min-h-[44px] min-w-[80px]"
            >
              Annuler
            </Button>
          ),
          duration: 3000,
        });
        
        // Auto-dismiss after 3s
        undoTimeout = setTimeout(() => {
          // Task permanently deleted after timeout
        }, 3000);
      }
    },
  });

  const playBalloonSounds = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Balloon inflate sound (whoosh up)
      const inflateOscillator = audioContext.createOscillator();
      const inflateGain = audioContext.createGain();
      
      inflateOscillator.type = 'sine';
      inflateOscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      inflateOscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      
      inflateGain.gain.setValueAtTime(0, audioContext.currentTime);
      inflateGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
      inflateGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      inflateOscillator.connect(inflateGain);
      inflateGain.connect(audioContext.destination);
      
      inflateOscillator.start(audioContext.currentTime);
      inflateOscillator.stop(audioContext.currentTime + 0.3);

      // Balloon pop sound (sharp burst)
      setTimeout(() => {
        const popContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const popOscillator = popContext.createOscillator();
        const popGain = popContext.createGain();
        const popFilter = popContext.createBiquadFilter();
        
        popOscillator.type = 'square';
        popOscillator.frequency.setValueAtTime(800, popContext.currentTime);
        popOscillator.frequency.exponentialRampToValueAtTime(50, popContext.currentTime + 0.1);
        
        popFilter.type = 'lowpass';
        popFilter.frequency.setValueAtTime(2000, popContext.currentTime);
        
        popGain.gain.setValueAtTime(0.2, popContext.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.01, popContext.currentTime + 0.1);
        
        popOscillator.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(popContext.destination);
        
        popOscillator.start(popContext.currentTime);
        popOscillator.stop(popContext.currentTime + 0.1);
      }, 400);
    } catch (error) {
      console.log('Audio playback not supported');
    }
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
    <div 
      className="relative overflow-hidden"
      {...handlers}
    >
      {/* Swipe indicators */}
      {swipeOffset !== 0 && (
        <>
          {/* Right swipe - Complete */}
          {swipeOffset > 0 && (
            <div 
              className="absolute inset-0 bg-success/20 flex items-center justify-start pl-6 rounded-2xl z-0"
              style={{ opacity: Math.min(Math.abs(swipeOffset) / 100, 1) }}
            >
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
          )}
          
          {/* Left swipe - Delete */}
          {swipeOffset < 0 && (
            <div 
              className="absolute inset-0 bg-accent/20 flex items-center justify-end pr-6 rounded-2xl z-0"
              style={{ opacity: Math.min(Math.abs(swipeOffset) / 100, 1) }}
            >
              <Trash2 className="w-6 h-6 text-accent" />
            </div>
          )}
        </>
      )}
      
      <BalloonBurst show={showBalloons} onComplete={() => setShowBalloons(false)} />
      
      <Card 
        ref={setNodeRef} 
        style={{
          ...style,
          transform: swipeOffset !== 0 
            ? `translateX(${swipeOffset}px)` 
            : style.transform,
        }} 
        className={cn(
          "py-2 px-3 transition-all duration-300 ease-in-out shadow-card hover:shadow-balloon rounded-2xl relative z-10 cursor-pointer",
          "bg-gradient-card border-border/50",
          isAnimating && "scale-95 opacity-75",
          isCompleting && "animate-confetti-explosion",
          task.completed && "bg-gradient-success shadow-success",
          isDragging && "opacity-50 scale-95 z-50"
        )}
        data-testid="task-item"
        onClick={() => onEdit(task)}
      >
        {showCelebration && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="celebration-text bg-gradient-to-r from-primary to-success text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              🎈 Bravo! 🎈
            </div>
          </div>
        )}
      <div className="flex items-start gap-2">
        <div 
          className="cursor-grab active:cursor-grabbing mt-0.5 opacity-40 hover:opacity-80 transition-opacity -m-2 p-2"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="-m-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={task.completed ? `Marquer "${task.title}" comme non terminée` : `Marquer "${task.title}" comme terminée`}
          data-testid="task-check"
        >
          <Checkbox
            checked={task.completed}
            className={cn(
              "h-5 w-5 pointer-events-none data-[state=checked]:bg-success data-[state=checked]:border-success transition-all duration-300",
              isCompleting && "animate-checkmark"
            )}
            role="checkbox"
            aria-live="polite"
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p 
              className={cn(
                "text-[15px] font-medium leading-snug tracking-tight transition-all duration-200",
                task.completed ? "text-success-foreground line-through" : "text-card-foreground"
              )}
              data-testid="task-title"
            >
              {task.title}
            </p>
            <span className={cn(
              "shrink-0 text-xs",
              getPriorityColor(task.priority)
            )}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>
          
          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground mb-2 line-clamp-2 leading-snug",
              task.completed && "line-through"
            )}>
              {task.description}
            </p>
          )}

          {onAddSubTask && onReorderSubTasks && onDeleteSubTask && (
            <div className="my-2" onClick={(e) => e.stopPropagation()}>
              <SubTaskList
                taskId={task.id}
                subTasks={task.subTasks || []}
                onToggle={onSubTaskToggle}
                onAdd={onAddSubTask}
                onReorder={onReorderSubTasks}
                onDelete={onDeleteSubTask}
              />
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs mt-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px]",
              task.completed 
                ? "bg-success/20 text-success-foreground" 
                : "bg-primary/20 text-primary"
            )}>
              Créé: {formatDate(task.createdAt)}
            </span>
            {task.completedAt && (
              <span className="px-2 py-0.5 rounded-full bg-success/20 text-success-foreground text-[11px]">
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