import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';

// Saudi Arabia city approximate coordinates (normalized to SVG viewBox 0-500)
const CITY_COORDS: Record<string, { x: number; y: number }> = {
  'riyadh': { x: 300, y: 260 },
  'jeddah': { x: 155, y: 270 },
  'mecca': { x: 160, y: 285 },
  'makkah': { x: 160, y: 285 },
  'medina': { x: 175, y: 215 },
  'madinah': { x: 175, y: 215 },
  'dammam': { x: 370, y: 220 },
  'khobar': { x: 375, y: 225 },
  'al khobar': { x: 375, y: 225 },
  'dhahran': { x: 373, y: 222 },
  'tabuk': { x: 140, y: 155 },
  'abha': { x: 195, y: 340 },
  'taif': { x: 175, y: 295 },
  'hail': { x: 245, y: 180 },
  'najran': { x: 235, y: 360 },
  'jubail': { x: 365, y: 210 },
  'yanbu': { x: 150, y: 235 },
  'khamis mushait': { x: 200, y: 345 },
  'buraidah': { x: 270, y: 210 },
  'qassim': { x: 270, y: 210 },
  'al ahsa': { x: 360, y: 240 },
  'hofuf': { x: 360, y: 245 },
  'jazan': { x: 185, y: 370 },
  'jizan': { x: 185, y: 370 },
  'al baha': { x: 185, y: 320 },
  'arar': { x: 250, y: 130 },
  'sakaka': { x: 220, y: 140 },
  'bisha': { x: 210, y: 330 },
  'wadi al-dawasir': { x: 265, y: 320 },
  'al qatif': { x: 370, y: 218 },
  'unaizah': { x: 275, y: 215 },
  'rabigh': { x: 150, y: 250 },
  'al kharj': { x: 310, y: 275 },
};

function findCityCoords(name: string): { x: number; y: number } | null {
  const lower = name.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }
  return null;
}

interface CityGeoMapProps {
  data: { name: string; value: number }[];
}

export default function CityGeoMap({ data }: CityGeoMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);

  const mappedCities = useMemo(() => {
    return data.map((d, i) => {
      const coords = findCityCoords(d.name);
      // Fallback: distribute unknown cities in a grid
      const fallback = {
        x: 100 + (i % 5) * 70,
        y: 380 + Math.floor(i / 5) * 30,
      };
      return {
        ...d,
        coords: coords || fallback,
        hasCoords: !!coords,
      };
    });
  }, [data]);

  if (!data.length) {
    return <p className="text-muted-foreground text-sm">No data</p>;
  }

  return (
    <div className="h-72 relative">
      <svg viewBox="0 0 500 420" className="w-full h-full" style={{ fontFamily: 'inherit' }}>
        {/* Saudi Arabia simplified outline */}
        <path
          d="M120,130 L160,110 L200,105 L230,100 L270,105 L300,115 L340,130 L380,155 
             L400,180 L410,210 L400,240 L390,260 L380,280 L370,300 
             L350,310 L330,300 L310,310 L290,330 L270,350 L250,370 
             L230,380 L210,375 L190,370 L175,360 L165,340 L160,320 
             L155,305 L145,290 L140,270 L135,250 L130,235 L125,215 
             L120,195 L115,170 L118,150 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={1.5}
          opacity={0.5}
        />

        {/* City pins */}
        {mappedCities.map((city) => {
          const size = 6 + (city.value / maxValue) * 14;
          const isHovered = hoveredCity === city.name;

          return (
            <g
              key={city.name}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pin glow */}
              <circle
                cx={city.coords.x}
                cy={city.coords.y}
                r={size + 4}
                fill="hsl(var(--primary))"
                opacity={isHovered ? 0.25 : 0.1}
                className="transition-all duration-200"
              />
              {/* Pin circle */}
              <circle
                cx={city.coords.x}
                cy={city.coords.y}
                r={size}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
                opacity={isHovered ? 1 : 0.8}
                className="transition-all duration-200"
              />
              {/* Value inside */}
              {size > 10 && (
                <text
                  x={city.coords.x}
                  y={city.coords.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="hsl(var(--primary-foreground))"
                  fontSize={Math.max(7, size * 0.6)}
                  fontWeight={700}
                >
                  {city.value}
                </text>
              )}
              {/* City label */}
              <text
                x={city.coords.x}
                y={city.coords.y - size - 5}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize={isHovered ? 11 : 9}
                fontWeight={isHovered ? 700 : 500}
                opacity={isHovered ? 1 : 0.7}
                className="transition-all duration-200"
              >
                {city.name}
              </text>

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={city.coords.x + size + 6}
                    y={city.coords.y - 18}
                    width={Math.max(80, city.name.length * 7 + 40)}
                    height={36}
                    rx={6}
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                  />
                  <text
                    x={city.coords.x + size + 14}
                    y={city.coords.y - 4}
                    fill="hsl(var(--foreground))"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {city.name}
                  </text>
                  <text
                    x={city.coords.x + size + 14}
                    y={city.coords.y + 10}
                    fill="hsl(var(--muted-foreground))"
                    fontSize={9}
                  >
                    {city.value} records
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-1 left-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <MapPin className="h-3 w-3 text-primary" />
        <span>Size = volume</span>
      </div>
    </div>
  );
}
