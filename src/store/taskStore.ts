import { create } from 'zustand';
import { Task } from '@/components/TaskCard';
import { storage, HistoryEntry } from '@/lib/storage';

const UNDO_MS = 3000;

interface TrashItem {
  snapshot: Task;
  from: 'tasks' | 'history';
  dateKey?: string;
  index: number;
  expiresAt: number;
}

interface TaskStore {
  tasks: Task[];
  trash: Record<string, TrashItem>;
  timers: Record<string, number>;
  isLoading: boolean;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  loadTasks: () => Promise<void>;
  saveTasks: () => Promise<void>;
  
  addTask: (title: string, description?: string, priority?: Task['priority']) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  
  requestDeleteTask: (id: string, ctx?: { from: 'history'; dateKey: string }) => void;
  undoDelete: (id: string) => void;
  finalizeDelete: (id: string) => void;
  clearExpiredTrashOnStart: () => void;
  
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  reorderSubTasks: (taskId: string, oldIndex: number, newIndex: number) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  trash: {},
  timers: {},
  isLoading: true,

  setTasks: (tasks) => set({ tasks }),

  loadTasks: async () => {
    try {
      set({ isLoading: true });
      await storage.init();
      const storedTasks = await storage.getAllTasks();
      
      const tasksWithDates = storedTasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        subTasks: task.subTasks?.map(st => ({
          ...st,
          createdAt: new Date(st.createdAt),
          completedAt: st.completedAt ? new Date(st.completedAt) : undefined,
        }))
      }));
      
      set({ tasks: tasksWithDates });
      get().clearExpiredTrashOnStart();
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveTasks: async () => {
    try {
      await storage.saveTasks(get().tasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  },

  addTask: (title, description, priority = 'medium') => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date(),
      subTasks: [],
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    get().saveTasks();
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    }));
    get().saveTasks();
  },

  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map(task => {
        if (task.id === id) {
          const newCompleted = !task.completed;
          
          // If completing and has subtasks, complete all subtasks
          if (newCompleted && task.subTasks && task.subTasks.length > 0) {
            const allSubTasksCompleted = task.subTasks.every(st => st.completed);
            
            if (!allSubTasksCompleted) {
              // Complete all subtasks
              const now = new Date();
              const updatedSubTasks = task.subTasks.map(st => ({
                ...st,
                completed: true,
                completedAt: st.completedAt || now
              }));
              
              return {
                ...task,
                completed: true,
                completedAt: now,
                subTasks: updatedSubTasks
              };
            }
          }
          
          return {
            ...task,
            completed: newCompleted,
            completedAt: newCompleted ? new Date() : undefined
          };
        }
        return task;
      })
    }));
    get().saveTasks();
  },

  requestDeleteTask: (id, ctx) => {
    const state = get();
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return;
    
    const task = state.tasks[taskIndex];
    const expiresAt = Date.now() + UNDO_MS;
    
    // Store in trash
    set((s) => ({
      trash: {
        ...s.trash,
        [id]: {
          snapshot: task,
          from: ctx?.from || 'tasks',
          dateKey: ctx?.dateKey,
          index: taskIndex,
          expiresAt
        }
      }
    }));
    
    // Remove from tasks optimistically
    set((s) => ({
      tasks: s.tasks.filter(t => t.id !== id)
    }));
    
    // Set timer for finalization
    const timerId = window.setTimeout(() => {
      get().finalizeDelete(id);
    }, UNDO_MS);
    
    set((s) => ({
      timers: { ...s.timers, [id]: timerId }
    }));
    
    get().saveTasks();
  },

  undoDelete: (id) => {
    const state = get();
    const trashItem = state.trash[id];
    
    if (!trashItem) return;
    
    // Clear timer
    if (state.timers[id]) {
      clearTimeout(state.timers[id]);
    }
    
    // Restore task at original index
    set((s) => {
      const newTasks = [...s.tasks];
      newTasks.splice(trashItem.index, 0, trashItem.snapshot);
      
      const { [id]: _, ...remainingTrash } = s.trash;
      const { [id]: __, ...remainingTimers } = s.timers;
      
      return {
        tasks: newTasks,
        trash: remainingTrash,
        timers: remainingTimers
      };
    });
    
    get().saveTasks();
  },

  finalizeDelete: (id) => {
    set((s) => {
      const { [id]: _, ...remainingTrash } = s.trash;
      const { [id]: __, ...remainingTimers } = s.timers;
      
      return {
        trash: remainingTrash,
        timers: remainingTimers
      };
    });
  },

  clearExpiredTrashOnStart: () => {
    const state = get();
    const now = Date.now();
    
    Object.entries(state.trash).forEach(([id, item]) => {
      const remaining = item.expiresAt - now;
      
      if (remaining > 0) {
        // Re-arm timer
        const timerId = window.setTimeout(() => {
          get().finalizeDelete(id);
        }, remaining);
        
        set((s) => ({
          timers: { ...s.timers, [id]: timerId }
        }));
      } else {
        // Expired, just remove
        get().finalizeDelete(id);
      }
    });
  },

  toggleSubTask: (taskId, subTaskId) => {
    set((state) => ({
      tasks: state.tasks.map(task => {
        if (task.id === taskId && task.subTasks) {
          const updatedSubTasks = task.subTasks.map(st =>
            st.id === subTaskId
              ? { 
                  ...st, 
                  completed: !st.completed,
                  completedAt: !st.completed ? new Date() : undefined
                }
              : st
          );
          
          // Check if all subtasks are completed
          const allCompleted = updatedSubTasks.every(st => st.completed);
          
          // If all subtasks completed, complete parent task with max completedAt
          if (allCompleted && !task.completed) {
            const maxCompletedAt = new Date(
              Math.max(...updatedSubTasks.map(st => st.completedAt?.getTime() || 0))
            );
            
            return {
              ...task,
              subTasks: updatedSubTasks,
              completed: true,
              completedAt: maxCompletedAt
            };
          }
          
          return { ...task, subTasks: updatedSubTasks };
        }
        return task;
      })
    }));
    get().saveTasks();
  },

  addSubTask: (taskId, title) => {
    set((state) => ({
      tasks: state.tasks.map(task => {
        if (task.id === taskId) {
          const newSubTask = {
            id: `${taskId}-${Date.now()}`,
            text: title,
            completed: false,
            createdAt: new Date(),
            order: task.subTasks?.length || 0
          };
          
          return {
            ...task,
            subTasks: [...(task.subTasks || []), newSubTask]
          };
        }
        return task;
      })
    }));
    get().saveTasks();
  },

  reorderSubTasks: (taskId, oldIndex, newIndex) => {
    set((state) => ({
      tasks: state.tasks.map(task => {
        if (task.id === taskId && task.subTasks) {
          const subTasks = [...task.subTasks];
          const [moved] = subTasks.splice(oldIndex, 1);
          subTasks.splice(newIndex, 0, moved);
          
          // Update order
          const reordered = subTasks.map((st, idx) => ({ ...st, order: idx }));
          
          return { ...task, subTasks: reordered };
        }
        return task;
      })
    }));
    get().saveTasks();
  },

  deleteSubTask: (taskId, subTaskId) => {
    set((state) => ({
      tasks: state.tasks.map(task => {
        if (task.id === taskId && task.subTasks) {
          return {
            ...task,
            subTasks: task.subTasks.filter(st => st.id !== subTaskId)
          };
        }
        return task;
      })
    }));
    get().saveTasks();
  },
}));

// Expose for QA
if (typeof window !== 'undefined') {
  (window as any).runMidnightMaintenance = async () => {
    const { maintenanceManager } = await import('@/lib/maintenance');
    await maintenanceManager.runMidnightMaintenance();
    console.log('Maintenance triggered manually');
  };
}
