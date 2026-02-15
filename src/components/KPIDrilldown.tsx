import { useDashboard } from '@/contexts/DashboardContext';
import { KPIData, DRILLDOWN_MAP, KPI_ICONS, TOP_KPI_DISPLAY_NAMES } from '@/lib/kpiProcessor';
import KPICard from './KPICard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface Props {
  data: KPIData;
  metricKey: string;
  onBack: () => void;
}

export default function KPIDrilldown({ data, metricKey, onBack }: Props) {
  const { formatValue, isDark } = useDashboard();
  const heroMetric = data.metricsByName[metricKey];
  const whyKeys = DRILLDOWN_MAP[metricKey] || [];
  const displayName = TOP_KPI_DISPLAY_NAMES[metricKey] || metricKey;
  const icon = KPI_ICONS[metricKey] || '📊';

  const whyMetrics = whyKeys
    .map(k => data.metricsByName[k])
    .filter(Boolean);

  // Comparison chart data
  const chartData = whyMetrics.map(m => ({
    name: (TOP_KPI_DISPLAY_NAMES[m.name] || m.name).replace(/^#/, ''),
    current: m.currentValue,
    previous: m.previousValue,
  }));

  const tooltipStyle = {
    backgroundColor: isDark ? 'hsl(215, 22%, 11%)' : 'hsl(0, 0%, 100%)',
    border: `1px solid ${isDark ? 'hsl(215, 18%, 18%)' : 'hsl(200, 18%, 90%)'}`,
    borderRadius: '8px',
    color: isDark ? 'hsl(200, 15%, 92%)' : 'hsl(200, 25%, 10%)',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to KPI Overview
        </Button>
      </div>

      {/* Hero Card */}
      {heroMetric && (
        <div className="rounded-xl border border-primary/20 bg-card p-6 gradient-brand/5">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{icon}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground mt-1">{heroMetric.definition}</p>
              <div className="mt-4">
                <KPICard metric={heroMetric} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Contributing Metrics</h3>

        {whyMetrics.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
            <p className="text-muted-foreground">No contributing metrics data available yet.</p>
          </div>
        ) : (
          <>
            {/* Why Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
              {whyMetrics.map(m => (
                <KPICard key={m.name} metric={m} compact />
              ))}
            </div>

            {/* Comparison Bar Chart */}
            {chartData.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-sm font-semibold text-foreground mb-4">Current vs Previous Period</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'hsl(215,18%,18%)' : 'hsl(200,18%,90%)'} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? 'hsl(200,10%,58%)' : 'hsl(200,10%,46%)' }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={110}
                        tick={{ fontSize: 10, fill: isDark ? 'hsl(200,10%,58%)' : 'hsl(200,10%,46%)' }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="current" fill="hsl(var(--primary))" name="Current" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="previous" fill="hsl(var(--muted-foreground))" opacity={0.4} name="Previous" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
