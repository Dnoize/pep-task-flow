import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Plus, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubTask } from './TaskCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubTaskListProps {
  taskId: string;
  subTasks: SubTask[];
  onToggle: (taskId: string, subTaskId: string) => void;
  onAdd: (taskId: string, title: string) => void;
  onReorder: (taskId: string, oldIndex: number, newIndex: number) => void;
  onDelete: (taskId: string, subTaskId: string) => void;
}

const SortableSubTaskItem = ({ 
  subTask, 
  taskId,
  onToggle, 
  onDelete 
}: { 
  subTask: SubTask; 
  taskId: string;
  onToggle: (taskId: string, subTaskId: string) => void;
  onDelete: (taskId: string, subTaskId: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subTask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-lg bg-background/50 border border-border/30 group min-h-[44px]",
        isDragging && "opacity-50 z-50"
      )}
      data-testid={`subtask-item-${subTask.id}`}
    >
      <div
        className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-80 transition-opacity touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Checkbox
        checked={subTask.completed}
        onCheckedChange={() => onToggle(taskId, subTask.id)}
        className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
        data-testid={`subtask-check-${subTask.id}`}
      />
      
      <span
        className={cn(
          "text-sm flex-1",
          subTask.completed
            ? "text-success line-through opacity-70"
            : "text-card-foreground"
        )}
      >
        {subTask.text}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(taskId, subTask.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
        data-testid={`subtask-delete-${subTask.id}`}
      >
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  );
};

export const SubTaskList = ({
  taskId,
  subTasks = [],
  onToggle,
  onAdd,
  onReorder,
  onDelete,
}: SubTaskListProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const completedCount = subTasks.filter(st => st.completed).length;
  const totalCount = subTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTaskTitle.trim()) {
      onAdd(taskId, newSubTaskTitle.trim());
      setNewSubTaskTitle('');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = subTasks.findIndex(st => st.id === active.id);
    const newIndex = subTasks.findIndex(st => st.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(taskId, oldIndex, newIndex);
    }
  };

  if (totalCount === 0 && !isOpen) return null;

  return (
    <div 
      className="mt-3 space-y-2 p-3 bg-muted/20 rounded-lg border border-border/30"
      data-testid="subtask-list"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] -my-1"
        data-testid="subtask-toggle"
      >
        <span>
          Sous-tâches ({completedCount}/{totalCount})
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {totalCount > 0 && (
        <Progress value={progress} className="h-1" />
      )}

      {isOpen && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={subTasks.map(st => st.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {subTasks.map((subTask) => (
                  <SortableSubTaskItem
                    key={subTask.id}
                    subTask={subTask}
                    taskId={taskId}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <form onSubmit={handleAddSubTask} className="flex gap-2 mt-2">
            <Input
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              placeholder="+ Ajouter une sous-tâche"
              className="text-sm h-10"
              style={{ fontSize: '16px' }}
              data-testid="subtask-input"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newSubTaskTitle.trim()}
              className="h-10 px-3"
              data-testid="subtask-add"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
};
