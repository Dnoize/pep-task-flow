interface ProgressRibbonProps {
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export const ProgressRibbon = ({ progress, totalTasks, completedTasks }: ProgressRibbonProps) => {
  return (
    <div className="max-w-md mx-auto mb-3 lg:mb-6" data-testid="progress-percent">
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="text-sm">🎈</span>
          <span className="font-medium">Progression du jour</span>
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
