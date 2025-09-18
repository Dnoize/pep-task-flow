import { Task, TaskCard } from "./TaskCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  type: "todo" | "done";
}

export const TaskColumn = ({ title, tasks, onToggleTask, onEditTask, type }: TaskColumnProps) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: type,
  });

  return (
    <div className="flex-1 min-w-0" ref={setNodeRef}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className={cn(
          "text-xl font-bold",
          type === "todo" ? "text-primary" : "text-success"
        )}>
          {title}
        </h2>
        <Badge variant={type === "todo" ? "default" : "secondary"} className={cn(
          "text-xs font-medium",
          type === "todo" ? "bg-primary/20 text-primary border-primary/30" : "bg-success/20 text-success border-success/30"
        )}>
          {tasks.length}
        </Badge>
      </div>
      
      <div className={cn(
        "space-y-3 min-h-[200px] transition-colors duration-200 rounded-lg p-2",
        isOver && "bg-primary/5 border-2 border-dashed border-primary/30"
      )}>
        {tasks.length === 0 ? (
          <Card className="p-8 text-center bg-muted/30 border-dashed border-2 border-muted">
            <p className="text-muted-foreground text-sm">
              {type === "todo" ? "Aucune tâche à faire" : "Aucune tâche terminée"}
            </p>
          </Card>
        ) : (
          <SortableContext 
            items={tasks.map(task => task.id)} 
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
};