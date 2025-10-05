import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/TaskCard";
import { CheckCircle2 } from "lucide-react";

interface CompletedSidebarProps {
  tasks: Task[];
  onViewAll: () => void;
}

export const CompletedSidebar = ({ tasks, onViewAll }: CompletedSidebarProps) => {
  if (tasks.length === 0) return null;

  return (
    <aside 
      className="hidden lg:block sticky top-24 max-h-[calc(100vh-120px)] overflow-auto"
      role="complementary"
      aria-label="Tâches terminées aujourd'hui"
    >
      <div className="rounded-2xl border border-success/20 bg-success/5 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🎈</div>
            <div>
              <h3 className="text-sm font-semibold text-success">
                Terminées
              </h3>
              <p className="text-xs text-success/70">
                {tasks.length} aujourd'hui
              </p>
            </div>
          </div>
        </div>
        
        <div 
          className="space-y-2 mb-3" 
          role="list"
          aria-live="polite"
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              role="listitem"
              className="bg-white border border-success/20 rounded-xl px-3 py-2 text-sm text-foreground shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{task.title}</span>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onViewAll}
          variant="ghost"
          size="sm"
          className="w-full text-success hover:text-success hover:bg-success/10 focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
        >
          Voir toutes les terminées
        </Button>
      </div>
    </aside>
  );
};
