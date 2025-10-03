import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/TaskCard";
import { CheckCircle2 } from "lucide-react";

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
    <div className="bg-success/5 border border-success/20 rounded-lg p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <h3 className="text-sm font-semibold text-success">
            Terminées aujourd'hui ({tasks.length})
          </h3>
        </div>
        <Button
          onClick={onViewAll}
          variant="ghost"
          size="sm"
          className="text-success hover:text-success hover:bg-success/10 h-8"
        >
          Voir tout
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayedTasks.map((task) => (
          <Badge
            key={task.id}
            variant="outline"
            className="bg-white border-success/30 text-foreground hover:bg-success/10 transition-colors animate-scale-in"
          >
            {task.title}
          </Badge>
        ))}
        {hasMore && (
          <Badge
            variant="outline"
            className="bg-success/10 border-success/30 text-success"
          >
            +{tasks.length - max} autres
          </Badge>
        )}
      </div>
    </div>
  );
};
