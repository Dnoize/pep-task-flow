interface ProgressRibbonProps {
  progress: number;
  totalTasks: number;
  completedTasks: number;
  compact?: boolean;
}

export const ProgressRibbon = ({ progress, totalTasks, completedTasks, compact = false }: ProgressRibbonProps) => {
  if (compact) {
    // Ultra-compact inline version
    return (
      <div className="max-w-md mx-auto mb-0.5" data-testid="progress-percent">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-slate-500 tabular-nums min-w-[32px] text-right">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  }

  // Normal version
  return (
    <div className="max-w-md mx-auto mb-2 lg:mb-4" data-testid="progress-percent">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span className="flex items-center gap-1.5">
          <span className="text-xs">🎈</span>
          <span className="font-medium">Progression</span>
        </span>
        <span className="font-semibold tabular-nums">{Math.round(progress)}%</span>
      </div>
      
      <div className="relative w-full bg-muted rounded-full h-2 overflow-visible">
        {/* Progress bar */}
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        
        {/* Discrete dot marker - smaller and more subtle */}
        <div 
          className="absolute -top-[2px] size-2.5 rounded-full bg-sky-600 shadow-sm transition-all duration-500 ease-out"
          style={{ left: `calc(${progress}% - 5px)` }}
          aria-hidden="true"
          title={`${completedTasks} / ${totalTasks}`}
        />
      </div>
    </div>
  );
};
