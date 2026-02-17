import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

// Logo imports
import appStoreLogo from '@/assets/channels/app-store.jpeg';
import chatgptLogo from '@/assets/channels/chatgpt.png';
import googleLogo from '@/assets/channels/google.png';
import instagramLogo from '@/assets/channels/instagram.jpeg';
import mokafaaLogo from '@/assets/channels/mokafaa.png';
import purpleSaturdayLogo from '@/assets/channels/purple-saturday.png';
import tiktokLogo from '@/assets/channels/tiktok.png';
import whatsappLogo from '@/assets/channels/whatsapp.png';
import xLogo from '@/assets/channels/x.png';
import snapchatLogo from '@/assets/channels/snapchat.png';

type ChannelVisual =
  | { type: 'logo'; src: string }
  | { type: 'icon'; render: (size: number, color: string) => JSX.Element };

// SVG icon renderers for channels without logos
const SvgIcons = {
  founder: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20l-2-8-4 4-4-8-4 8-4-4z" />
      <circle cx="12" cy="5" r="2" />
    </svg>
  ),
  sms: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
    </svg>
  ),
  none: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  family: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21v-2a4 4 0 0 1 4-4h2" />
      <circle cx="7" cy="10" r="3" />
      <path d="M15 21v-2a4 4 0 0 1 4-4h0" />
      <circle cx="17" cy="10" r="3" />
      <path d="M12 21v-6" />
      <circle cx="12" cy="6" r="3" />
    </svg>
  ),
  oldCustomer: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  friend: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  doctor: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v8M8 6h8" />
      <rect x="5" y="14" width="14" height="8" rx="2" />
      <path d="M12 14v4M10 18h4" />
    </svg>
  ),
  therapist: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M16 14l2 2-2 2" />
    </svg>
  ),
  default: (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

function getChannelVisual(name: string): ChannelVisual {
  const lower = name.toLowerCase().trim();
  // Logo-based channels
  if (lower.includes('mokaf')) return { type: 'logo', src: mokafaaLogo };
  if (lower.includes('purple') || lower.includes('saturday')) return { type: 'logo', src: purpleSaturdayLogo };
  if (lower.includes('chatgpt') || lower.includes('chat gpt') || lower.includes('gpt')) return { type: 'logo', src: chatgptLogo };
  if (lower.includes('whatsapp') || lower === 'wa') return { type: 'logo', src: whatsappLogo };
  if (lower.includes('app store') || lower.includes('appstore')) return { type: 'logo', src: appStoreLogo };
  if (lower.includes('google')) return { type: 'logo', src: googleLogo };
  if (lower === 'x' || lower === 'twitter') return { type: 'logo', src: xLogo };
  if (lower.includes('instagram') || lower === 'ig') return { type: 'logo', src: instagramLogo };
  if (lower.includes('tiktok') || lower.includes('tik tok')) return { type: 'logo', src: tiktokLogo };
  if (lower.includes('snapchat') || lower.includes('snap')) return { type: 'logo', src: snapchatLogo };
  // Icon-based channels
  if (lower.includes('founder')) return { type: 'icon', render: SvgIcons.founder };
  if (lower.includes('sms')) return { type: 'icon', render: SvgIcons.sms };
  if (lower === 'none' || lower === '-' || lower === '') return { type: 'icon', render: SvgIcons.none };
  if (lower.includes('family')) return { type: 'icon', render: SvgIcons.family };
  if (lower.includes('old') && lower.includes('customer')) return { type: 'icon', render: SvgIcons.oldCustomer };
  if (lower.includes('friend')) return { type: 'icon', render: SvgIcons.friend };
  if (lower.includes('doctor') || lower.includes('dr')) return { type: 'icon', render: SvgIcons.doctor };
  if (lower.includes('therapist')) return { type: 'icon', render: SvgIcons.therapist };
  return { type: 'icon', render: SvgIcons.default };
}

const TREEMAP_COLORS = [
  'hsl(170,65%,36%)', 'hsl(207,72%,48%)', 'hsl(190,65%,42%)',
  'hsl(155,55%,40%)', 'hsl(225,60%,55%)', 'hsl(145,50%,50%)',
  'hsl(30,80%,55%)', 'hsl(340,65%,50%)', 'hsl(270,55%,55%)',
  'hsl(60,60%,45%)',
];

interface TreemapContentProps {
  x?: number; y?: number; width?: number; height?: number;
  name?: string; value?: number; index?: number; depth?: number;
  totalValue?: number;
}

function CustomTreemapContent(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', index = 0, depth = 0 } = props;

  if (depth !== 1 || width < 16 || height < 16) return null;

  const color = TREEMAP_COLORS[index % TREEMAP_COLORS.length];
  const visual = getChannelVisual(name);
  const padding = 0.15;
  const innerW = width * (1 - padding * 2);
  const innerH = height * (1 - padding * 2);
  const iconSize = Math.max(14, Math.min(Math.min(innerW, innerH) * 0.6, 48));

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6}
        fill={color} stroke="hsl(var(--background))" strokeWidth={2}
        style={{ opacity: 0.92 }} />
      <foreignObject
        x={x + (width - iconSize) / 2}
        y={y + (height - iconSize) / 2}
        width={iconSize} height={iconSize}
      >
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {visual.type === 'logo' ? (
            <img src={visual.src} alt={name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }}
              loading="lazy" />
          ) : (
            visual.render(iconSize * 0.85, 'white')
          )}
        </div>
      </foreignObject>
    </g>
  );
}

interface ChannelTreemapProps {
  data: { name: string; value: number }[];
}

export default function ChannelTreemap({ data }: ChannelTreemapProps) {
  const totalValue = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const treemapData = useMemo(() =>
    data.map((d, i) => ({ ...d, fill: TREEMAP_COLORS[i % TREEMAP_COLORS.length], totalValue })),
    [data, totalValue]
  );

  if (!data.length) return <p className="text-muted-foreground text-sm">No data</p>;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap data={treemapData} dataKey="value" nameKey="name"
          stroke="hsl(var(--background))"
          content={<CustomTreemapContent />}
        >
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const item = payload[0]?.payload;
              if (!item) return null;
              const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0';
              const rank = [...data].sort((a, b) => b.value - a.value).findIndex(d => d.name === item.name) + 1;
              return (
                <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl space-y-0.5">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">Count: {item.value}</p>
                  <p className="text-muted-foreground">{pct}% of total</p>
                  <p className="text-muted-foreground">Rank: #{rank}</p>
                </div>
              );
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
