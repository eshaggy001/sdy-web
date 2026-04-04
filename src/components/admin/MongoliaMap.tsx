// src/components/admin/MongoliaMap.tsx
import { MONGOLIA_SVG_PATH, DASHBOARD_REGIONS, type RegionData } from '@/src/constants/dashboardMock';

const PULSE_CONFIG: Record<RegionData['density'], { rings: number[]; centerR: number; centerOpacity: number; ringOpacity: number[]; strokeWidth: number[] }> = {
  highest: {
    rings: [44, 34],
    centerR: 4,
    centerOpacity: 0.9,
    ringOpacity: [0.12, 0.16],
    strokeWidth: [1.5, 1.8],
  },
  high: {
    rings: [30, 22],
    centerR: 3.5,
    centerOpacity: 0.8,
    ringOpacity: [0.1, 0.14],
    strokeWidth: [1.2, 1.5],
  },
  medium: {
    rings: [20, 14],
    centerR: 2.5,
    centerOpacity: 0.7,
    ringOpacity: [0.08, 0.08],
    strokeWidth: [0.8, 0.6],
  },
  low: {
    rings: [10],
    centerR: 2,
    centerOpacity: 0.5,
    ringOpacity: [0.06],
    strokeWidth: [0.5],
  },
};

const RED_DOT_RADIUS: Record<RegionData['density'], number> = {
  highest: 42,
  high: 28,
  medium: 20,
  low: 14,
};

const FILL_LAYERS: Record<RegionData['density'], { r: number; opacity: number }[]> = {
  highest: [{ r: 24, opacity: 0.1 }, { r: 16, opacity: 0.18 }, { r: 8, opacity: 0.35 }],
  high: [{ r: 14, opacity: 0.1 }, { r: 7, opacity: 0.22 }],
  medium: [{ r: 12, opacity: 0.08 }, { r: 5, opacity: 0.18 }],
  low: [{ r: 5, opacity: 0.08 }],
};

export const MongoliaMap = () => {
  return (
    <svg viewBox="20 0 970 470" className="w-full h-auto max-h-[300px]">
      <defs>
        <clipPath id="mnClip">
          <path d={MONGOLIA_SVG_PATH} />
        </clipPath>
        <pattern id="baseDots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2" fill="#d4d4d8" />
        </pattern>
        <pattern id="redDots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2" fill="#ED1B24" />
        </pattern>
      </defs>

      <g clipPath="url(#mnClip)">
        {/* Base gray dot grid */}
        <rect x="0" y="0" width="1000" height="481" fill="url(#baseDots)" />

        {/* Red activated dots per region */}
        {DASHBOARD_REGIONS.map((r) => (
          <circle key={r.name.en} cx={r.cx} cy={r.cy} r={RED_DOT_RADIUS[r.density]} fill="url(#redDots)" />
        ))}

        {/* Pulse hotspots */}
        {DASHBOARD_REGIONS.map((r) => {
          const cfg = PULSE_CONFIG[r.density];
          return (
            <g key={`pulse-${r.name.en}`}>
              {/* Ring strokes */}
              {cfg.rings.map((ring, i) => (
                <circle key={`ring-${i}`} cx={r.cx} cy={r.cy} r={ring} fill="none" stroke="#ED1B24" strokeWidth={cfg.strokeWidth[i]} opacity={cfg.ringOpacity[i]} />
              ))}
              {/* Fill layers */}
              {FILL_LAYERS[r.density].map((layer, i) => (
                <circle key={`fill-${i}`} cx={r.cx} cy={r.cy} r={layer.r} fill="#ED1B24" opacity={layer.opacity} />
              ))}
              {/* Center dot */}
              <circle cx={r.cx} cy={r.cy} r={cfg.centerR} fill="#ED1B24" opacity={cfg.centerOpacity} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
