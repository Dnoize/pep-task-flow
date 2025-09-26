import { Task } from "@/components/TaskCard";
import { storage, HistoryEntry } from "./storage";

export class MaintenanceManager {
  private timeoutId: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    await this.runMidnightMaintenance();
    this.scheduleMidnightJob();
  }

  scheduleMidnightJob() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    this.timeoutId = setTimeout(() => {
      this.runMidnightMaintenance();
      this.scheduleMidnightJob(); // reschedule for next day
    }, msUntilMidnight);
  }

  async runMidnightMaintenance(): Promise<Task[]> {
    try {
      const [tasks, meta] = await Promise.all([
        storage.getAllTasks(),
        storage.getMeta()
      ]);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Find tasks completed before today that are still marked as "done"
      const tasksToArchive = tasks.filter(task => {
        if (task.completed && task.completedAt) {
          const completedDate = new Date(task.completedAt);
          return completedDate < today;
        }
        return false;
      });

      if (tasksToArchive.length === 0) {
        await storage.saveMeta({ lastMaintenanceRun: now.toISOString() });
        return tasks;
      }

      // Group tasks by completion date
      const tasksByDate: Record<string, Task[]> = {};
      
      tasksToArchive.forEach(task => {
        const completedDate = new Date(task.completedAt!);
        const dateKey = this.formatDateKey(completedDate);
        
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
      });

      // Save to history
      const historyPromises = Object.entries(tasksByDate).map(([date, dateTasks]) => {
        const historyEntry: HistoryEntry = { date, tasks: dateTasks };
        return storage.saveHistoryEntry(historyEntry);
      });

      await Promise.all(historyPromises);

      // Remove archived tasks from main task list
      const remainingTasks = tasks.filter(task => !tasksToArchive.includes(task));
      
      await Promise.all([
        storage.saveTasks(remainingTasks),
        storage.saveMeta({ lastMaintenanceRun: now.toISOString() })
      ]);

      return remainingTasks;
    } catch (error) {
      console.error('Maintenance failed:', error);
      return await storage.getAllTasks();
    }
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const maintenanceManager = new MaintenanceManager();