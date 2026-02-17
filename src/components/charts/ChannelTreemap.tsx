import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Phone, Globe, MessageCircle, Instagram, Facebook, Users, Building2, Megaphone, Share2, type LucideIcon } from 'lucide-react';

const CHANNEL_ICON_MAP: Record<string, LucideIcon> = {
  'whatsapp': MessageCircle,
  'wa': MessageCircle,
  'phone': Phone,
  'call': Phone,
  'calls': Phone,
  'website': Globe,
  'web': Globe,
  'instagram': Instagram,
  'ig': Instagram,
  'facebook': Facebook,
  'fb': Facebook,
  'referral': Users,
  'partner': Building2,
  'partnership': Building2,
  'campaign': Megaphone,
  'social': Share2,
  'social media': Share2,
};

const TREEMAP_COLORS = [
  'hsl(170,65%,36%)', 'hsl(207,72%,48%)', 'hsl(190,65%,42%)',
  'hsl(155,55%,40%)', 'hsl(225,60%,55%)', 'hsl(145,50%,50%)',
  'hsl(30,80%,55%)', 'hsl(340,65%,50%)', 'hsl(270,55%,55%)',
  'hsl(60,60%,45%)',
];

function getChannelIcon(name: string): LucideIcon {
  const lower = name.toLowerCase().trim();
  for (const [key, icon] of Object.entries(CHANNEL_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return Globe;
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  index?: number;
  depth?: number;
}

function CustomTreemapContent(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', value = 0, index = 0, depth = 0 } = props;
  
  if (depth !== 1 || width < 20 || height < 20) return null;

  const color = TREEMAP_COLORS[index % TREEMAP_COLORS.length];
  const Icon = getChannelIcon(name);
  const iconSize = Math.min(width, height) * 0.3;
  const clampedIcon = Math.max(14, Math.min(iconSize, 32));
  const showLabel = width > 60 && height > 50;
  const showValue = width > 50 && height > 65;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={color}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        style={{ opacity: 0.9, transition: 'opacity 0.2s' }}
      />
      {/* Icon centered */}
      <foreignObject
        x={x + (width - clampedIcon) / 2}
        y={y + (showLabel ? (height * 0.15) : (height - clampedIcon) / 2)}
        width={clampedIcon}
        height={clampedIcon}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Icon size={clampedIcon * 0.85} color="white" strokeWidth={1.8} />
        </div>
      </foreignObject>
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height * 0.62}
          textAnchor="middle"
          fill="white"
          fontSize={Math.max(9, Math.min(12, width / 8))}
          fontWeight={600}
        >
          {name.length > 12 ? name.slice(0, 11) + '…' : name}
        </text>
      )}
      {showValue && (
        <text
          x={x + width / 2}
          y={y + height * 0.78}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={Math.max(8, Math.min(10, width / 9))}
        >
          {value}
        </text>
      )}
    </g>
  );
}

interface ChannelTreemapProps {
  data: { name: string; value: number }[];
}

export default function ChannelTreemap({ data }: ChannelTreemapProps) {
  const treemapData = useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      fill: TREEMAP_COLORS[i % TREEMAP_COLORS.length],
    }));
  }, [data]);

  if (!data.length) {
    return <p className="text-muted-foreground text-sm">No data</p>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="value"
          nameKey="name"
          stroke="hsl(var(--background))"
          content={<CustomTreemapContent />}
        >
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const item = payload[0]?.payload;
              if (!item) return null;
              return (
                <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">{item.value} records</p>
                </div>
              );
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
