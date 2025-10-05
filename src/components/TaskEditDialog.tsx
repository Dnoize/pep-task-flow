import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { Task, Priority, SubTask } from "./TaskCard";

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export const TaskEditDialog = ({ task, open, onClose, onSave }: TaskEditDialogProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<Priority>(task?.priority || "medium");
  const [subTasks, setSubTasks] = useState<SubTask[]>(task?.subTasks || []);
  const [newSubTask, setNewSubTask] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setSubTasks(task.subTasks || []);
    }
  }, [task]);

  const addSubTask = () => {
    if (newSubTask.trim()) {
      const newSub: SubTask = {
        id: Date.now().toString(),
        text: newSubTask.trim(),
        completed: false,
        createdAt: new Date(),
        order: subTasks.length
      };
      setSubTasks([...subTasks, newSub]);
      setNewSubTask("");
    }
  };

  const removeSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const toggleSubTask = (id: string) => {
    setSubTasks(subTasks.map(st => 
      st.id === id ? { 
        ...st, 
        completed: !st.completed,
        completedAt: !st.completed ? new Date() : undefined
      } : st
    ));
  };

  const handleSave = () => {
    if (!task || !title.trim()) return;
    
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      subTasks: subTasks.length > 0 ? subTasks : undefined
    };
    
    onSave(updatedTask);
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Éditer la tâche</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la tâche"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter des notes..."
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Priorité</Label>
            <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Normal</SelectItem>
                <SelectItem value="high">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Sous-tâches</Label>
            <div className="space-y-2">
              {subTasks.map((subTask) => (
                <div key={subTask.id} className="flex items-center gap-2 p-2 border rounded-md bg-card">
                  <Checkbox
                    checked={subTask.completed}
                    onCheckedChange={() => toggleSubTask(subTask.id)}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <span className="flex-1 text-sm">{subTask.text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubTask(subTask.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  placeholder="Ajouter une sous-tâche..."
                  onKeyPress={(e) => e.key === 'Enter' && addSubTask()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSubTask}
                  disabled={!newSubTask.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Sauvegarder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};