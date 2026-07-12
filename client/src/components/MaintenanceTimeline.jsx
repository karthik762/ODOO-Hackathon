import { Check, X } from 'lucide-react';

export default function MaintenanceTimeline({ status }) {
  const isRejected = status === 'Rejected';
  
  const getStepStatus = (step) => {
    if (isRejected) {
      if (step === 1) return 'completed';
      if (step === 2) return 'rejected';
      return 'upcoming';
    }
    
    // Normal flow progression
    if (status === 'Pending') {
      return step === 1 ? 'active' : 'upcoming';
    }
    if (status === 'Approved') {
      if (step === 1) return 'completed';
      if (step === 2) return 'completed';
      if (step === 3) return 'active';
      return 'upcoming';
    }
    if (status === 'Resolved') {
      return 'completed';
    }
    return 'upcoming';
  };

  const steps = [
    { num: 1, label: 'Reported' },
    { num: 2, label: isRejected ? 'Rejected' : 'Approved' },
    { num: 3, label: 'In Repair' },
    { num: 4, label: 'Resolved' }
  ];

  return (
    <div className="flex flex-col gap-3 py-3 w-full">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Workflow Progression Timeline
      </span>
      
      <div className="relative flex justify-between items-center px-4 py-6 bg-muted/20 border border-border/50 rounded-xl mt-2 overflow-hidden">
        {/* Connection Line */}
        <div 
          className={`absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 z-0 rounded-full transition-colors duration-500
            ${isRejected ? 'bg-destructive/30' : (status === 'Resolved' ? 'bg-emerald-500/30' : 'bg-border')}`}
        >
          {/* Active progress fill */}
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-in-out
              ${isRejected ? 'bg-destructive w-[33%]' : 
                status === 'Resolved' ? 'bg-emerald-500 w-full' : 
                status === 'Approved' ? 'bg-primary w-[66%]' : 
                'bg-primary w-0'}`}
          />
        </div>

        {steps.map((s, idx) => {
          const stepStatus = getStepStatus(s.num);
          
          return (
            <div key={s.num} className="flex flex-col items-center gap-2 z-10 w-16">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-sm
                  ${stepStatus === 'completed' 
                    ? 'bg-emerald-500 text-white border-2 border-emerald-500 scale-110 shadow-emerald-500/20' 
                    : stepStatus === 'active' 
                      ? 'bg-primary text-primary-foreground border-2 border-primary scale-110 shadow-primary/30 ring-4 ring-primary/20' 
                      : stepStatus === 'rejected' 
                        ? 'bg-destructive text-destructive-foreground border-2 border-destructive scale-110 shadow-destructive/20' 
                        : 'bg-background text-muted-foreground border-2 border-border/60'}
                `}
              >
                {stepStatus === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : stepStatus === 'rejected' ? (
                  <X className="w-4 h-4" />
                ) : (
                  s.num
                )}
              </div>
              <span 
                className={`
                  text-[10px] sm:text-xs font-semibold text-center leading-tight
                  ${stepStatus === 'upcoming' ? 'text-muted-foreground/60' : 'text-foreground'}
                  ${stepStatus === 'active' ? 'text-primary' : ''}
                  ${stepStatus === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                  ${stepStatus === 'rejected' ? 'text-destructive' : ''}
                `}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
