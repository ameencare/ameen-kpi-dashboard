import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import saudiMapBg from '@/assets/saudi-map.jpg';

// City coordinates mapped to percentage positions on the uploaded map image
const CITY_COORDS: Record<string, { x: number; y: number }> = {
  'riyadh': { x: 55, y: 45 },
  'jeddah': { x: 27, y: 52 },
  'mecca': { x: 28, y: 57 },
  'makkah': { x: 28, y: 57 },
  'medina': { x: 30, y: 40 },
  'madinah': { x: 30, y: 40 },
  'dammam': { x: 78, y: 33 },
  'khobar': { x: 80, y: 35 },
  'al khobar': { x: 80, y: 35 },
  'dhahran': { x: 79, y: 34 },
  'tabuk': { x: 22, y: 25 },
  'abha': { x: 33, y: 76 },
  'taif': { x: 30, y: 58 },
  'hail': { x: 42, y: 28 },
  'najran': { x: 52, y: 82 },
  'jubail': { x: 76, y: 30 },
  'yanbu': { x: 24, y: 42 },
  'khamis mushait': { x: 34, y: 77 },
  'buraidah': { x: 48, y: 32 },
  'qassim': { x: 48, y: 32 },
  'al ahsa': { x: 74, y: 42 },
  'hofuf': { x: 74, y: 43 },
  'jazan': { x: 30, y: 85 },
  'jizan': { x: 30, y: 85 },
  'al baha': { x: 31, y: 68 },
  'arar': { x: 48, y: 10 },
  'sakaka': { x: 38, y: 14 },
  'bisha': { x: 36, y: 72 },
  'wadi al-dawasir': { x: 48, y: 70 },
  'al qatif': { x: 77, y: 32 },
  'unaizah': { x: 49, y: 34 },
  'rabigh': { x: 25, y: 48 },
  'al kharj': { x: 58, y: 50 },
  'eastern province': { x: 78, y: 55 },
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
    let fallbackIdx = 0;
    return data.map((d) => {
      const coords = findCityCoords(d.name);
      const fallback = { x: 10 + (fallbackIdx % 4) * 20, y: 90 + Math.floor(fallbackIdx / 4) * 5 };
      if (!coords) fallbackIdx++;
      return { ...d, coords: coords || fallback, hasCoords: !!coords };
    });
  }, [data]);

  if (!data.length) {
    return <p className="text-muted-foreground text-sm">No data</p>;
  }

  return (
    <div className="h-80 relative rounded-lg overflow-hidden bg-muted/30">
      {/* Map background */}
      <img
        src={saudiMapBg}
        alt="Saudi Arabia Map"
        className="absolute inset-0 w-full h-full object-contain opacity-70 dark:opacity-50 dark:invert-[0.15]"
        draggable={false}
      />

      {/* Pins overlay */}
      {mappedCities.map((city) => {
        const size = 10 + (city.value / maxValue) * 18;
        const isHovered = hoveredCity === city.name;

        return (
          <div
            key={city.name}
            className="absolute group"
            style={{
              left: `${city.coords.x}%`,
              top: `${city.coords.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isHovered ? 50 : 10,
            }}
            onMouseEnter={() => setHoveredCity(city.name)}
            onMouseLeave={() => setHoveredCity(null)}
          >
            {/* Glow ring */}
            <div
              className="absolute rounded-full bg-primary/20 transition-all duration-200"
              style={{
                width: size + 12,
                height: size + 12,
                top: -(size + 12) / 2,
                left: -(size + 12) / 2 + size / 2,
                opacity: isHovered ? 0.5 : 0.2,
              }}
            />
            {/* Pin dot */}
            <div
              className="rounded-full bg-primary border-2 border-background shadow-md transition-all duration-200 flex items-center justify-center cursor-pointer"
              style={{
                width: size,
                height: size,
                opacity: isHovered ? 1 : 0.85,
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              {size > 16 && (
                <span className="text-primary-foreground font-bold" style={{ fontSize: Math.max(7, size * 0.4) }}>
                  {city.value}
                </span>
              )}
            </div>

            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-card border border-border shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150">
                <p className="text-xs font-semibold text-foreground">{city.name}</p>
                <p className="text-[10px] text-muted-foreground">{city.value} records</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-r border-b border-border rotate-45 -mt-1" />
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-muted-foreground bg-background/70 backdrop-blur-sm rounded px-2 py-1">
        <MapPin className="h-3 w-3 text-primary" />
        <span>Pin size = volume</span>
      </div>
    </div>
  );
}
