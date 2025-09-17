import { useState } from "react";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskColumn } from "@/components/TaskColumn";
import { Task } from "@/components/TaskCard";
import { CheckSquare } from "lucide-react";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date(),
    };
    setTasks([newTask, ...tasks]);
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

  const todoTasks = tasks.filter(task => !task.completed);
  const doneTasks = tasks.filter(task => task.completed);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-primary shadow-vibrant">
              <CheckSquare className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Ma Todo List
            </h1>
          </div>
          <p className="text-muted-foreground text-lg capitalize">
            {today}
          </p>
        </header>

        {/* Add Task Form */}
        <AddTaskForm onAdd={addTask} />

        {/* Task Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskColumn
            title="À FAIRE"
            tasks={todoTasks}
            onToggleTask={toggleTask}
            type="todo"
          />
          <TaskColumn
            title="TERMINÉ"
            tasks={doneTasks}
            onToggleTask={toggleTask}
            type="done"
          />
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-gradient-card shadow-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{todoTasks.length}</div>
              <div className="text-xs text-muted-foreground">À faire</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{doneTasks.length}</div>
              <div className="text-xs text-muted-foreground">Terminées</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;