import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/TaskCard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CompletedCollapsibleProps {
  tasks: Task[];
  onViewAll: () => void;
}

export const CompletedCollapsible = ({ tasks, onViewAll }: CompletedCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem('completedCollapsibleOpen');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('completedCollapsibleOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  if (tasks.length === 0) return null;

  const displayTasks = tasks.slice(0, 5);

  return (
    <div className="lg:hidden mb-6 rounded-2xl border border-success/20 bg-success/5 p-4 shadow-sm" data-testid="done-today-accordion">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-success rounded-lg p-2 -m-2"
        aria-expanded={isOpen}
        aria-controls="completed-tasks-mobile"
      >
        <div className="flex items-center gap-2">
          <div className="text-2xl">🎈</div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-success">
              Terminées aujourd'hui ({tasks.length})
            </h3>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-success" />
        ) : (
          <ChevronDown className="w-5 h-5 text-success" />
        )}
      </button>

      {isOpen && (
        <div id="completed-tasks-mobile" className="animate-accordion-down">
          <div className="flex flex-wrap gap-2 mb-3 mt-3">
            {displayTasks.map((task) => (
              <Badge
                key={task.id}
                variant="secondary"
                className="bg-white border border-success/20 text-foreground text-xs px-2 py-1 rounded-full shadow-sm"
              >
                {task.title}
              </Badge>
            ))}
            {tasks.length > 5 && (
              <Badge
                variant="secondary"
                className="bg-success/10 border border-success/20 text-success text-xs px-2 py-1 rounded-full"
              >
                +{tasks.length - 5} autres
              </Badge>
            )}
          </div>

          <Button
            onClick={onViewAll}
            variant="ghost"
            size="sm"
            className="w-full text-success hover:text-success hover:bg-success/10 min-h-[44px]"
          >
            Voir toutes les terminées
          </Button>
        </div>
      )}
    </div>
  );
};
