import { useState, useEffect, useRef } from "react";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskColumn } from "@/components/TaskColumn";
import { TaskEditDialog } from "@/components/TaskEditDialog";
import { HistoryView } from "@/components/HistoryView";
import { CompletedInlineSummary } from "@/components/CompletedInlineSummary";
import { CompletedSidebar } from "@/components/CompletedSidebar";
import { ProgressRibbon } from "@/components/ProgressRibbon";
import { Task, Priority } from "@/components/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage } from "@/lib/storage";
import { maintenanceManager } from "@/lib/maintenance";
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
  const [activeTab, setActiveTab] = useState("todo");
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from storage on mount
  useEffect(() => {
    loadTasks();
  }, []);


  // Save tasks to storage whenever tasks change
  useEffect(() => {
    if (!isLoading && tasks.length >= 0) {
      storage.saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      await storage.init();
      const storedTasks = await storage.getAllTasks();
      
      // Convert date strings back to Date objects
      const tasksWithDates = storedTasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
      
      setTasks(sortTasksByPriority(tasksWithDates));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  
  // Only show tasks completed today in "Terminées (Aujourd'hui)"
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const doneTasks = sortedTasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= todayStart;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">Chargement...</div>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-success to-accent bg-clip-text text-transparent mb-4">
              🎈 Balloon Tasks 🎈
            </h1>
            <p className="text-muted-foreground mb-4">
              Organisez vos tâches avec légèreté et motivation
            </p>
            
            {/* Balloon ribbon progress bar */}
            <ProgressRibbon 
              progress={tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0}
              totalTasks={tasks.length}
              completedTasks={doneTasks.length}
            />
          </div>

          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="todo" className="gap-2">
                  À faire 
                  <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full text-xs">
                    {todoTasks.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="done" className="gap-2">
                  Terminées (Aujourd'hui)
                  <span className="bg-success/20 text-success px-2 py-0.5 rounded-full text-xs">
                    {doneTasks.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="history">
                  Historique
                </TabsTrigger>
              </TabsList>

              <TabsContent value="todo" className="mt-0 space-y-6">
                <AddTaskForm onAdd={addTask} />
                
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">
                    <CompletedInlineSummary 
                      tasks={doneTasks} 
                      max={5}
                      onViewAll={() => setActiveTab("done")}
                    />
                    <TaskColumn
                      title="À FAIRE"
                      tasks={todoTasks}
                      onToggleTask={toggleTask}
                      onEditTask={handleEditTask}
                      onSubTaskToggle={handleSubTaskToggle}
                      type="todo"
                    />
                  </div>
                  
                  <CompletedSidebar 
                    tasks={doneTasks}
                    onViewAll={() => setActiveTab("done")}
                  />
                </div>
              </TabsContent>

              <TabsContent value="done" className="mt-0 space-y-6">
                <TaskColumn
                  title="TERMINÉES (AUJOURD'HUI)"
                  tasks={doneTasks}
                  onToggleTask={toggleTask}
                  onEditTask={handleEditTask}
                  onSubTaskToggle={handleSubTaskToggle}
                  type="done"
                />
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-6">
                <HistoryView onRefresh={loadTasks} />
              </TabsContent>
            </Tabs>

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