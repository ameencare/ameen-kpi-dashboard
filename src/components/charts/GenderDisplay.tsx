import { useMemo } from 'react';

const MaleIcon = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="16" r="10" fill="hsl(207,72%,48%)" opacity={0.15} stroke="hsl(207,72%,48%)" strokeWidth="2" />
    <path d="M32 26c-10 0-18 7-18 16v6a2 2 0 002 2h32a2 2 0 002-2v-6c0-9-8-16-18-16z" fill="hsl(207,72%,48%)" opacity={0.15} stroke="hsl(207,72%,48%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="16" r="5" fill="hsl(207,72%,48%)" />
  </svg>
);

const FemaleIcon = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="14" r="10" fill="hsl(340,65%,50%)" opacity={0.15} stroke="hsl(340,65%,50%)" strokeWidth="2" />
    <path d="M32 24c-10 0-18 7-18 16v2l10 8h16l10-8v-2c0-9-8-16-18-16z" fill="hsl(340,65%,50%)" opacity={0.15} stroke="hsl(340,65%,50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="14" r="5" fill="hsl(340,65%,50%)" />
  </svg>
);

interface GenderDisplayProps {
  data: { name: string; value: number }[];
}

export default function GenderDisplay({ data }: GenderDisplayProps) {
  const { maleCount, femaleCount, malePct, femalePct } = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0);
    const male = data.find(d => d.name.toLowerCase().includes('male') && !d.name.toLowerCase().includes('female'))?.value ?? 0;
    const female = data.find(d => d.name.toLowerCase().includes('female'))?.value ?? 0;
    return {
      maleCount: male,
      femaleCount: female,
      malePct: total > 0 ? ((male / total) * 100).toFixed(1) : '0',
      femalePct: total > 0 ? ((female / total) * 100).toFixed(1) : '0',
    };
  }, [data]);

  if (!data.length) return <p className="text-muted-foreground text-sm">No data</p>;

  return (
    <div className="flex items-center justify-center gap-12 h-64">
      {/* Male */}
      <div className="flex flex-col items-center gap-3 transition-all duration-500">
        <MaleIcon size={72} />
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Male</p>
          <p className="text-2xl font-bold text-foreground tabular-nums transition-all duration-500">{malePct}%</p>
          <p className="text-xs text-muted-foreground">{maleCount} records</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-24 w-px bg-border" />

      {/* Female */}
      <div className="flex flex-col items-center gap-3 transition-all duration-500">
        <FemaleIcon size={72} />
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Female</p>
          <p className="text-2xl font-bold text-foreground tabular-nums transition-all duration-500">{femalePct}%</p>
          <p className="text-xs text-muted-foreground">{femaleCount} records</p>
        </div>
      </div>
    </div>
  );
}
