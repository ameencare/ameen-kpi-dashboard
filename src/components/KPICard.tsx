import { KPIMetricData, TOP_KPI_DISPLAY_NAMES } from '@/lib/kpiProcessor';
import { useDashboard } from '@/contexts/DashboardContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  metric: KPIMetricData;
  onClick?: () => void;
  compact?: boolean;
}

export default function KPICard({ metric, onClick, compact }: Props) {
  const { formatValue } = useDashboard();
  const displayName = TOP_KPI_DISPLAY_NAMES[metric.name] || metric.name;

  const isUp = metric.delta > 0;
  const isDown = metric.delta < 0;
  const isNeutral = metric.delta === 0;
  const isGood = isNeutral ? null : (isUp ? metric.isPositiveGood : !metric.isPositiveGood);

  const trendColor = isNeutral
    ? 'text-neutral'
    : isGood
    ? 'text-positive'
    : 'text-negative';

  const sparkColor = isGood === null ? 'hsl(var(--neutral))' : isGood ? 'hsl(var(--positive))' : 'hsl(var(--negative))';

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 animate-fade-in ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5' : ''
      } ${compact ? 'p-3' : ''}`}
    >
      {/* Metric Name */}
      <p className={`font-medium text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
        {displayName}
      </p>

      {/* Current Value */}
      <p className={`font-bold text-foreground mt-1 ${compact ? 'text-lg' : 'text-2xl'}`}>
        {formatValue(metric.currentValue, metric.valueType)}
      </p>

      {/* Delta */}
      <div className={`flex items-center gap-1.5 mt-2 ${trendColor}`}>
        {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : isDown ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        <span className="text-xs font-semibold">
          {isUp ? '+' : ''}{metric.percentChange.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">
          vs {formatValue(metric.previousValue, metric.valueType)}
        </span>
      </div>

      {/* Sparkline */}
      {metric.sparklineData.length > 1 && !compact && (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric.sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Click indicator */}
      {onClick && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-primary font-medium">Drill →</span>
        </div>
      )}
    </div>
  );
}
