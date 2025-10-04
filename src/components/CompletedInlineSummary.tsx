import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/TaskCard";

interface CompletedInlineSummaryProps {
  tasks: Task[];
  max?: number;
  onViewAll: () => void;
}

export const CompletedInlineSummary = ({ 
  tasks, 
  max = 5, 
  onViewAll 
}: CompletedInlineSummaryProps) => {
  if (tasks.length === 0) return null;

  const displayedTasks = tasks.slice(0, max);
  const hasMore = tasks.length > max;

  return (
    <div 
      className="lg:hidden bg-success/5 border border-success/20 rounded-2xl p-3 animate-fade-in"
      aria-live="polite"
      aria-label="Tâches terminées aujourd'hui"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎈</span>
          <h3 className="text-sm font-semibold text-success">
            Terminées aujourd'hui ({tasks.length})
          </h3>
        </div>
        <Button
          onClick={onViewAll}
          variant="ghost"
          size="sm"
          className="text-success hover:text-success hover:bg-success/10 h-8 rounded-full"
        >
          Voir tout
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayedTasks.map((task) => (
          <Badge
            key={task.id}
            variant="outline"
            className="bg-white/90 border-success/30 rounded-full px-3 py-1.5 text-xs text-success font-medium hover:bg-success/10 transition-colors animate-scale-in inline-flex items-center gap-1.5"
          >
            <span className="text-sm">🎈</span>
            {task.title}
          </Badge>
        ))}
        {hasMore && (
          <Button
            onClick={onViewAll}
            variant="ghost"
            size="sm"
            className="rounded-full border border-success/30 bg-success/10 px-3 py-1.5 h-auto text-xs text-success hover:bg-success/20 focus-visible:ring-2 focus-visible:ring-success"
          >
            +{tasks.length - max} autres
          </Button>
        )}
      </div>
    </div>
  );
};
