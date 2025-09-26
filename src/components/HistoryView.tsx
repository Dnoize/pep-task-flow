import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { storage, HistoryEntry } from "@/lib/storage";
import { Task } from "@/components/TaskCard";
import { Search, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryViewProps {
  onRefresh?: () => void;
}

export const HistoryView = ({ onRefresh }: HistoryViewProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const historyData = await storage.getHistory();
      // Sort by date descending (most recent first)
      const sortedHistory = historyData.sort((a, b) => b.date.localeCompare(a.date));
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await storage.clearHistory();
      setHistory([]);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const formatDateHeader = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-accent/20 text-accent border-accent/40";
      case "medium": return "bg-info/20 text-info border-info/40";
      case "low": return "bg-sage/20 text-sage border-sage/40";
      default: return "bg-info/20 text-info border-info/40";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Haute";
      case "medium": return "Normale";
      case "low": return "Basse";
      default: return "Normale";
    }
  };

  const filteredHistory = history.filter(entry => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const dateMatch = formatDateHeader(entry.date).toLowerCase().includes(searchLower);
    const tasksMatch = entry.tasks.some(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower)
    );
    
    return dateMatch || tasksMatch;
  });

  const totalCompletedTasks = history.reduce((total, entry) => total + entry.tasks.length, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Chargement de l'historique...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-primary">Historique</h2>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">
            {totalCompletedTasks} tâches accomplies
          </Badge>
        </div>
        
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Effacer l'historique
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Effacer l'historique</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">
                  Effacer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Search */}
      {history.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'historique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* History Entries */}
      {filteredHistory.length === 0 ? (
        <Card className="p-8 text-center bg-muted/30 border-dashed border-2 border-muted">
          <div className="text-muted-foreground">
            {history.length === 0 
              ? "Aucune tâche dans l'historique" 
              : "Aucun résultat trouvé"}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map((entry) => (
            <div key={entry.date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <h3 className="font-semibold text-primary text-lg">
                  {formatDateHeader(entry.date)}
                </h3>
                <Badge variant="outline" className="bg-success/20 text-success border-success/40">
                  {entry.tasks.length} {entry.tasks.length === 1 ? 'tâche' : 'tâches'}
                </Badge>
              </div>
              
              {/* Tasks for this date */}
              <div className="grid gap-3">
                {entry.tasks.map((task: Task) => (
                  <Card key={task.id} className="p-4 bg-card/50 border-border/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-card-foreground line-through opacity-70">
                            {task.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(task.priority))}
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-through opacity-60">
                            {task.description}
                          </p>
                        )}
                        
                        {task.subTasks && task.subTasks.length > 0 && (
                          <div className="mb-2 text-xs text-muted-foreground">
                            Sous-tâches: {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} terminées
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-success font-medium">
                        {task.completedAt && formatTime(task.completedAt)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};