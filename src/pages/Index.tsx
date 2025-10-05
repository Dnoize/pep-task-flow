import { useEffect, useRef } from "react";
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
import { CompactAddBar } from "@/components/CompactAddBar";
import { Task } from "@/components/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskStore } from "@/store/taskStore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";

const Index = () => {
  const { 
    tasks, 
    isLoading,
    loadTasks,
    addTask,
    updateTask,
    toggleTask,
    requestDeleteTask,
    undoDelete,
    toggleSubTask,
    addSubTask,
    reorderSubTasks,
    deleteSubTask,
    setTasks
  } = useTaskStore();
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("todo");
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [showFAB, setShowFAB] = useState(true);
  
  const addTaskRef = useRef<HTMLDivElement>(null);
  const compactInputRef = useRef<HTMLInputElement>(null);
  const stickyWrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  const handleFABClick = () => {
    setActiveTab("todo");
    
    if (isHeaderCompact && compactInputRef.current) {
      setTimeout(() => {
        compactInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        compactInputRef.current?.focus();
      }, 100);
    } else {
      setTimeout(() => {
        addTaskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = addTaskRef.current?.querySelector('input');
        input?.focus();
      }, 100);
    }
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

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    requestDeleteTask(id);
    
    // Show toast with undo
    toast({
      title: "Tâche supprimée",
      description: task.title,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            undoDelete(id);
            toast({
              title: "Tâche restaurée",
              description: task.title,
            });
          }}
          className="min-h-[44px] min-w-[80px]"
          data-testid="toast-undo"
        >
          Annuler
        </Button>
      ),
      duration: 3000,
    });
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
        toggleTask(activeId as string);
      }
      return;
    }

    // Reordering within the same list
    const oldIndex = tasks.findIndex(task => task.id === activeId);
    const newIndex = tasks.findIndex(task => task.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(tasks, oldIndex, newIndex);
      setTasks(reordered);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const sortedTasks = sortTasksByPriority(tasks);
  const todoTasks = sortedTasks.filter(task => !task.completed);
  
  // Only show tasks completed today
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
          paddingBottom: 'calc(84px + env(safe-area-inset-bottom))',
          minHeight: '100dvh',
          overscrollBehaviorY: 'contain'
        }}
      >
        <div className="max-w-6xl mx-auto p-4">
          {/* Sentinel for IntersectionObserver */}
          <div ref={sentinelRef} className="h-1 -mt-1" aria-hidden="true" />
          
          {/* Sticky Header */}
          <div 
            ref={stickyWrapperRef}
            className={`sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-50/60 border-b border-slate-200 transition-all duration-300 -mx-4 px-4 ${
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
              
              {/* Progress ribbon */}
              <ProgressRibbon 
                progress={tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0}
                totalTasks={tasks.length}
                completedTasks={doneTasks.length}
                data-testid="progress-percent"
              />
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="todo" className="gap-2" data-testid="tab-todo">
                    À faire 
                    <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {todoTasks.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="done" className="gap-2" data-testid="tab-done">
                    <span className="hidden sm:inline">Terminées (Aujourd'hui)</span>
                    <span className="sm:hidden">Terminées</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {doneTasks.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="history" data-testid="tab-history">
                    Historique
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold ml-1">
                      📅
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Compact Add Bar */}
            {isHeaderCompact && activeTab === "todo" && (
              <CompactAddBar
                ref={compactInputRef}
                onAdd={(title) => addTask(title)}
                visible={isHeaderCompact}
                className="mb-3"
              />
            )}
          </div>

          <div className="space-y-6 mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="todo" className="mt-0 space-y-6">
                {!isHeaderCompact && (
                  <div ref={addTaskRef}>
                    <AddTaskForm onAdd={addTask} />
                  </div>
                )}
                
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">
                    <CompletedInlineSummary 
                      tasks={doneTasks} 
                      max={5}
                      onViewAll={() => setActiveTab("done")}
                    />
                    
                    {/* Mobile Collapsible */}
                    <CompletedCollapsible 
                      tasks={doneTasks}
                      onViewAll={() => setActiveTab("done")}
                    />
                    
                    <TaskColumn
                      title="À FAIRE"
                      tasks={todoTasks}
                      onToggleTask={toggleTask}
                      onEditTask={handleEditTask}
                      onSubTaskToggle={toggleSubTask}
                      onDeleteTask={handleDeleteTask}
                      onAddSubTask={addSubTask}
                      onReorderSubTasks={reorderSubTasks}
                      onDeleteSubTask={deleteSubTask}
                      type="todo"
                    />
                  </div>
                  
                  {/* Desktop Sidebar */}
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
                  onSubTaskToggle={toggleSubTask}
                  onAddSubTask={addSubTask}
                  onReorderSubTasks={reorderSubTasks}
                  onDeleteSubTask={deleteSubTask}
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
          <FloatingActionButton 
            onClick={handleFABClick} 
            visible={showFAB && !isHeaderCompact}
            data-testid="fab-add"
          />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
          
          {/* QA Button - Hidden */}
          <button
            onClick={() => (window as any).runMidnightMaintenance?.()}
            data-testid="btn-maintenance"
            className="hidden"
            aria-hidden="true"
          />
        </div>
      </div>
    </DndContext>
  );
};

export default Index;
