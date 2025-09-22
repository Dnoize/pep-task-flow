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
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-festive animate-pulse">
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Ma Todo List
            </h1>
          </div>
          <p className="text-muted-foreground text-lg capitalize">
            {today}
          </p>
        </header>

        {/* Stats */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-white/90 via-purple-50/90 to-pink-50/90 shadow-card border border-purple-200/30">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">{todoTasks.length}</div>
              <div className="text-xs text-purple-600 font-medium">À faire</div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-purple-300 to-pink-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">{doneTasks.length}</div>
              <div className="text-xs text-teal-600 font-medium">Terminées</div>
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
            type="todo"
          />
          <TaskColumn
            title="TERMINÉ"
            tasks={doneTasks}
            onToggleTask={toggleTask}
            onEditTask={handleEditTask}
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