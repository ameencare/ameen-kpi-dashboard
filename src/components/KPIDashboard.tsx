import { useEffect, useState, useCallback } from 'react';
import { useDashboard, type PeriodType } from '@/contexts/DashboardContext';
import { fetchKPIData, fetchKPIDataCustom, type KPIData, TOP_KPI_KEYS } from '@/lib/kpiProcessor';
import KPICard from './KPICard';
import KPIDrilldown from './KPIDrilldown';
import CustomizationFilter from './CustomizationFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PERIOD_OPTIONS: { key: PeriodType; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function KPIDashboard() {
  const { periodType, setPeriodType, refreshKey, setLastUpdated, drilldownMetric, setDrilldownMetric, customComparison } = useDashboard();
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let kpiData: KPIData;
      if (customComparison.enabled) {
        kpiData = await fetchKPIDataCustom(customComparison);
      } else {
        kpiData = await fetchKPIData(periodType);
      }
      setData(kpiData);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load KPI data');
    } finally {
      setLoading(false);
    }
  }, [periodType, setLastUpdated, customComparison]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // If drilldown is active
  if (drilldownMetric && data) {
    return <KPIDrilldown data={data} metricKey={drilldownMetric} onBack={() => setDrilldownMetric(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">KPI Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Key performance indicators at a glance</p>
        </div>
        {!customComparison.enabled && (
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriodType(opt.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  periodType === opt.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Customization Filter */}
      <CustomizationFilter />

      {/* Period Labels */}
      {data && !loading && (
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Current: <span className="text-foreground font-medium">{data.currentPeriodLabel}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground">Previous: <span className="text-foreground font-medium">{data.previousPeriodLabel}</span></span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-negative/30 bg-negative/5 p-4">
          <AlertCircle className="h-5 w-5 text-negative shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Unable to load data</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Top 5 KPI Cards */}
      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {TOP_KPI_KEYS.map(key => {
            const metric = data.metricsByName[key];
            if (!metric) return null;
            return (
              <KPICard
                key={key}
                metric={metric}
                onClick={() => setDrilldownMetric(key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
// Export data getter for CSV export
export function getKPIExportData(data: KPIData | null): string {
  if (!data) return '';
  const header = 'Metric,Current Value,Previous Value,Delta,% Change\n';
  const rows = data.metrics
    .map(m => `"${m.name}",${m.currentValue},${m.previousValue},${m.delta},${m.percentChange.toFixed(1)}%`)
    .join('\n');
  return header + rows;
}
