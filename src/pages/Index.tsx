import { useState } from "react";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskColumn } from "@/components/TaskColumn";
import { TaskEditDialog } from "@/components/TaskEditDialog";
import { Task, Priority } from "@/components/TaskCard";
import { CheckSquare } from "lucide-react";
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
} from '@dnd-kit/sortable';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortTasksByPriority = (tasks: Task[]) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const addTask = (title: string, description?: string, priority: Priority = "medium") => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date(),
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(sortTasksByPriority(updatedTasks));
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    ));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(sortTasksByPriority(updatedTasks));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;

    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // If dropping on a column (todo/done)
    if (overId === 'todo' || overId === 'done') {
      const shouldComplete = overId === 'done';
      if (activeTask.completed !== shouldComplete) {
        const updatedTasks = tasks.map(task => 
          task.id === activeId 
            ? { 
                ...task, 
                completed: shouldComplete,
                completedAt: shouldComplete ? new Date() : undefined
              }
            : task
        );
        setTasks(sortTasksByPriority(updatedTasks));
      }
      return;
    }

    // Reordering within the same list
    const oldIndex = tasks.findIndex(task => task.id === activeId);
    const newIndex = tasks.findIndex(task => task.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleSubTaskToggle = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.subTasks) {
        return {
          ...task,
          subTasks: task.subTasks.map(subTask =>
            subTask.id === subTaskId
              ? { ...subTask, completed: !subTask.completed }
              : subTask
          )
        };
      }
      return task;
    }));
  };

  const sortedTasks = sortTasksByPriority(tasks);
  const todoTasks = sortedTasks.filter(task => !task.completed);
  const doneTasks = sortedTasks.filter(task => task.completed);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Ma Todo List
          </h1>
          <p className="text-muted-foreground mb-4">
            Organisez vos tâches de manière efficace et motivante
          </p>
          
          {/* Barre de progression globale */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progression</span>
              <span>{tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 ease-out"
                style={{ width: `${tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <AddTaskForm onAdd={addTask} />

        {/* Task Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskColumn
            title="À FAIRE"
            tasks={todoTasks}
            onToggleTask={toggleTask}
            onEditTask={handleEditTask}
            onSubTaskToggle={handleSubTaskToggle}
            type="todo"
          />
          <TaskColumn
            title="TERMINÉ"
            tasks={doneTasks}
            onToggleTask={toggleTask}
            onEditTask={handleEditTask}
            onSubTaskToggle={handleSubTaskToggle}
            type="done"
          />
        </div>

        {/* Task Edit Dialog */}
        <TaskEditDialog
          task={editingTask}
          open={isEditDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveTask}
        />

        </div>
      </div>
    </DndContext>
  );
};

export default Index;