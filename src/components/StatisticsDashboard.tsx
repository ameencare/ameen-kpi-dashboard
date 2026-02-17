import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { fetchStatsData, countByField, type StatsRecord } from '@/lib/kpiProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, RotateCcw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area,
  LineChart, Line,
} from 'recharts';
import ChannelTreemap from '@/components/charts/ChannelTreemap';
import CityGeoMap from '@/components/charts/CityGeoMap';
import GenderDisplay from '@/components/charts/GenderDisplay';

const CHART_COLORS = [
  'hsl(170,65%,36%)', 'hsl(207,72%,48%)', 'hsl(190,65%,42%)',
  'hsl(155,55%,40%)', 'hsl(225,60%,55%)', 'hsl(145,50%,50%)',
  'hsl(30,80%,55%)', 'hsl(340,65%,50%)', 'hsl(270,55%,55%)',
  'hsl(60,60%,45%)',
];

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
      {children}
    </div>
  );
}

function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={10}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function HBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis type="number" tick={{ fontSize: 11 } as any} />
          <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 10 } as any} />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function VBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 12)} margin={{ bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 9 } as any} />
          <YAxis tick={{ fontSize: 11 } as any} />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function StatisticsDashboard() {
  const { refreshKey, setLastUpdated } = useDashboard();
  const [records, setRecords] = useState<StatsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStatsData();
      setRecords(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [setLastUpdated]);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  const filtered = useMemo(() => {
    let result = records;
    if (startDate) {
      const s = new Date(startDate);
      result = result.filter(r => r.date && r.date >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59);
      result = result.filter(r => r.date && r.date <= e);
    }
    return result;
  }, [records, startDate, endDate]);

  const typeData = useMemo(() => countByField(filtered, 'type'), [filtered]);
  const channelData = useMemo(() => countByField(filtered, 'channel'), [filtered]);
  const cityData = useMemo(() => countByField(filtered, 'city'), [filtered]);
  const genderData = useMemo(() => countByField(filtered, 'gender'), [filtered]);
  const ageData = useMemo(() => countByField(filtered, 'age'), [filtered]);
  const serviceData = useMemo(() => countByField(filtered, 'service'), [filtered]);
  const attemptTimeData = useMemo(() => countByField(filtered, 'attemptTime'), [filtered]);
  const bookedByData = useMemo(() => countByField(filtered, 'bookedBy'), [filtered]);
  const therapistData = useMemo(() => countByField(filtered, 'therapistClassification'), [filtered]);
  const periodData = useMemo(() => countByField(filtered, 'preferredPeriod'), [filtered]);
  const timeToServeData = useMemo(() => countByField(filtered, 'timeToServe'), [filtered]);
  const paymentExData = useMemo(() => countByField(filtered, 'paymentExSession'), [filtered]);
  const paymentTTTData = useMemo(() => countByField(filtered, 'paymentTTT'), [filtered]);
  const paymentMethodData = useMemo(() => countByField(filtered, 'paymentMethod'), [filtered]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-52 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-negative/30 bg-negative/5 p-4">
        <AlertCircle className="h-5 w-5 text-negative" />
        <div className="flex-1">
          <p className="text-sm font-medium">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-3 w-3 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Statistics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} records {startDate || endDate ? '(filtered)' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36 h-8 text-xs" placeholder="Start date" />
          <span className="text-muted-foreground text-xs">to</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36 h-8 text-xs" placeholder="End date" />
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }} className="h-8 text-xs gap-1">
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Type Distribution">
            <DonutChart data={typeData} />
          </ChartCard>
          <ChartCard title="Channel Distribution">
            <ChannelTreemap data={channelData} />
          </ChartCard>
        </div>
      </div>

      {/* Customer Demographics */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Customer Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="City Distribution">
            <CityGeoMap data={cityData} />
          </ChartCard>
          <ChartCard title="Gender Distribution">
            <GenderDisplay data={genderData} />
          </ChartCard>
          <ChartCard title="Age Distribution">
            <VBarChart data={ageData} />
          </ChartCard>
          <ChartCard title="Services Breakdown">
            <HBarChart data={serviceData} />
          </ChartCard>
        </div>
      </div>

      {/* Operational Performance */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Operational Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Attempt Time (Heatmap)">
            <VBarChart data={attemptTimeData} />
          </ChartCard>
          <ChartCard title="Booked By">
            <HBarChart data={bookedByData} />
          </ChartCard>
          <ChartCard title="Therapist Classification">
            <VBarChart data={therapistData} />
          </ChartCard>
          <ChartCard title="Preferred Period">
            {periodData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={periodData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-muted-foreground text-sm">No data</p>}
          </ChartCard>
          <ChartCard title="Time to Serve">
            <VBarChart data={timeToServeData} />
          </ChartCard>
        </div>
      </div>

      {/* Financial Insights */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Payment of Ex. Session">
            {paymentExData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paymentExData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 } as any} />
                    <YAxis tick={{ fontSize: 11 } as any} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-muted-foreground text-sm">No data</p>}
          </ChartCard>
          <ChartCard title="Payment of TTT Plan">
            {paymentTTTData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={paymentTTTData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-muted-foreground text-sm">No data</p>}
          </ChartCard>
          <ChartCard title="Payment Method">
            <DonutChart data={paymentMethodData} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export function getStatsExportData(records: StatsRecord[]): string {
  const header = 'Phone,Type,Date,Channel,City,Service,Gender,Age,Therapist,Payment Method\n';
  const rows = records.map(r =>
    `"${r.phoneNumber}","${r.type}","${r.dateStr}","${r.channel}","${r.city}","${r.service}","${r.gender}","${r.age}","${r.therapistClassification}","${r.paymentMethod}"`
  ).join('\n');
  return header + rows;
}
