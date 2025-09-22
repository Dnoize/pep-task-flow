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
          type === "todo" 
            ? "bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" 
            : "bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent"
        )}>
          {title}
        </h2>
        <Badge variant={type === "todo" ? "default" : "secondary"} className={cn(
          "text-xs font-medium shadow-sm",
          type === "todo" 
            ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border-purple-200" 
            : "bg-gradient-to-r from-green-100 to-teal-100 text-teal-700 border-teal-200"
        )}>
          {tasks.length}
        </Badge>
      </div>
      
      <div className={cn(
        "space-y-3 min-h-[200px] transition-colors duration-200 rounded-lg p-2",
        isOver && (type === "todo" 
          ? "bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-dashed border-purple-300/50" 
          : "bg-gradient-to-br from-green-50 to-teal-50 border-2 border-dashed border-teal-300/50")
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