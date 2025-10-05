import { useState, useEffect, useRef, useCallback } from "react";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskColumn } from "@/components/TaskColumn";
import { TaskEditDialog } from "@/components/TaskEditDialog";
import { HistoryView } from "@/components/HistoryView";
import { CompletedInlineSummary } from "@/components/CompletedInlineSummary";
import { CompletedSidebar } from "@/components/CompletedSidebar";
import { CompletedCollapsible } from "@/components/CompletedCollapsible";
import { ProgressRibbon } from "@/components/ProgressRibbon";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Task, Priority } from "@/components/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage } from "@/lib/storage";
import { maintenanceManager } from "@/lib/maintenance";
import { debounce } from "@/lib/debounce";
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
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [showFAB, setShowFAB] = useState(true);
  const addTaskRef = useRef<HTMLDivElement>(null);
  const stickyWrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Debounced save function
  const debouncedSave = useCallback(
    debounce((tasksToSave: Task[]) => {
      storage.saveTasks(tasksToSave);
    }, 200),
    []
  );

  // Load tasks from storage on mount
  useEffect(() => {
    loadTasks();
  }, []);


  // Save tasks to storage with debounce
  useEffect(() => {
    if (!isLoading && tasks.length >= 0) {
      debouncedSave(tasks);
    }
  }, [tasks, isLoading, debouncedSave]);
  
  // Track sticky state with IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderCompact(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Track input focus to hide FAB
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        setShowFAB(false);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        setTimeout(() => setShowFAB(true), 200);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

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
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const handleFABClick = () => {
    setActiveTab("todo");
    setTimeout(() => {
      addTaskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = addTaskRef.current?.querySelector('input');
      input?.focus();
    }, 100);
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
      <div 
        className="min-h-screen bg-background"
        style={{
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
          minHeight: '100dvh'
        }}
      >
        <div className="max-w-6xl mx-auto p-4">
          {/* Sentinel for IntersectionObserver */}
          <div ref={sentinelRef} className="h-1 -mt-1" aria-hidden="true" />
          
          {/* Sticky Header */}
          <div 
            ref={stickyWrapperRef}
            className={`sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300 -mx-4 px-4 ${
              isHeaderCompact ? 'py-2' : 'py-4'
            }`}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cellipse cx=\'20\' cy=\'30\' rx=\'15\' ry=\'20\' fill=\'%2360A5FA\' opacity=\'0.04\'/%3E%3Cellipse cx=\'70\' cy=\'60\' rx=\'12\' ry=\'18\' fill=\'%2334D399\' opacity=\'0.05\'/%3E%3Cellipse cx=\'50\' cy=\'80\' rx=\'10\' ry=\'15\' fill=\'%23FB7185\' opacity=\'0.04\'/%3E%3C/svg%3E")',
              backgroundSize: '200px 200px',
              backgroundRepeat: 'repeat'
            }}
          >
            <div className="text-center">
              <h1 className={`font-bold transition-all duration-300 ${
                isHeaderCompact ? 'text-2xl mb-2' : 'text-4xl md:text-5xl mb-4'
              }`}
              style={{
                background: 'linear-gradient(to right, #60A5FA, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                🎈 Balloon Tasks 🎈
              </h1>
              {!isHeaderCompact && (
                <p className="text-muted-foreground mb-4">
                  Organisez vos tâches avec légèreté et motivation
                </p>
              )}
              
              {/* Balloon ribbon progress bar */}
              <ProgressRibbon 
                progress={tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0}
                totalTasks={tasks.length}
                completedTasks={doneTasks.length}
              />
            </div>
          </div>

          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="todo" className="gap-2">
                  À faire 
                  <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {todoTasks.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="done" className="gap-2">
                  <span className="hidden sm:inline">Terminées (Aujourd'hui)</span>
                  <span className="sm:hidden">Terminées</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {doneTasks.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="history">
                  Historique
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold ml-1">
                    📅
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="todo" className="mt-0 space-y-6">
                <div ref={addTaskRef}>
                  <AddTaskForm onAdd={addTask} />
                </div>
                
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">
                    <CompletedInlineSummary 
                      tasks={doneTasks} 
                      max={5}
                      onViewAll={() => setActiveTab("done")}
                    />
                    
                    {/* Mobile Collapsible - replaces sidebar on small screens */}
                    <CompletedCollapsible 
                      tasks={doneTasks}
                      onViewAll={() => setActiveTab("done")}
                    />
                    
                    <TaskColumn
                      title="À FAIRE"
                      tasks={todoTasks}
                      onToggleTask={toggleTask}
                      onEditTask={handleEditTask}
                      onSubTaskToggle={handleSubTaskToggle}
                      onDeleteTask={deleteTask}
                      type="todo"
                    />
                  </div>
                  
                  {/* Desktop Sidebar - hidden on mobile */}
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
          
          {/* Floating Action Button (Mobile Only) */}
          <FloatingActionButton onClick={handleFABClick} visible={showFAB} />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </div>
      </div>
    </DndContext>
  );
};

export default Index;