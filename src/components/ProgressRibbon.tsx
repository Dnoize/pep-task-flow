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
      
      <div className="relative w-full bg-muted rounded-full h-3 overflow-visible">
        {/* Progress bar */}
        <div 
          className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
        
        {/* Balloon indicator */}
        <div 
          className="absolute -top-5 transition-all duration-500 ease-out"
          style={{ 
            left: `calc(${progress}% - 16px)`,
            transform: 'translateY(-2px)',
          }}
        >
          <div className="relative group">
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" className="drop-shadow-md">
              <ellipse cx="16" cy="14" rx="14" ry="17" fill="url(#balloonGradient)" />
              <path d="M16 31 Q15 34, 16 38" stroke="#60A5FA" strokeWidth="1.5" opacity="0.7" />
              <defs>
                <linearGradient id="balloonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                {completedTasks} / {totalTasks}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
