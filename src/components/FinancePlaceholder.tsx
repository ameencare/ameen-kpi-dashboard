import { Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PLANNED_WIDGETS = ['Revenue Overview', 'Collections Tracker', 'Receivables Summary', 'Refunds & Compensations'];

export default function FinancePlaceholder() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand mb-4">
          <Lock className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Finance Dashboard</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          The Finance dashboard is coming soon. Track revenue, collections, receivables, and refunds all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANNED_WIDGETS.map(title => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 opacity-50 blur-[1px]">
            <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
            <div className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-40 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
