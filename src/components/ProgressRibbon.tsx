interface ProgressRibbonProps {
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export const ProgressRibbon = ({ progress, totalTasks, completedTasks }: ProgressRibbonProps) => {
  return (
    <div className="max-w-md mx-auto mb-6" data-testid="progress-percent">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span className="flex items-center gap-2">
          <span>🎈</span>
          <span className="font-medium">Progression du jour</span>
        </span>
        <span className="font-semibold">{Math.round(progress)}%</span>
      </div>
      
      <div className="relative w-full bg-muted rounded-full h-2 overflow-visible">
        {/* Progress bar */}
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        
        {/* Discrete dot marker */}
        <div 
          className="absolute -top-1 size-3 rounded-full bg-sky-500 shadow-sm transition-all duration-500 ease-out"
          style={{ left: `calc(${progress}% - 6px)` }}
          aria-hidden="true"
          title={`${completedTasks} / ${totalTasks}`}
        />
      </div>
    </div>
  );
};
