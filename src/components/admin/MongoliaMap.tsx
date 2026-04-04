// src/components/admin/MongoliaMap.tsx
import { DASHBOARD_REGIONS, type RegionData } from '@/src/constants/dashboardMock';

/* ── Size tokens per density tier ── */
const DOT_R: Record<RegionData['density'], number> = {
  highest: 10,
  high: 8,
  medium: 6,
  low: 5,
};

const GLOW_R: Record<RegionData['density'], number> = {
  highest: 40,
  high: 30,
  medium: 22,
  low: 14,
};

const GLOW_OPACITY: Record<RegionData['density'], number> = {
  highest: 0.3,
  high: 0.22,
  medium: 0.14,
  low: 0.08,
};

export const MongoliaMap = () => {
  return (
    <div className="relative w-full">
      {/* Base map image */}
      <img
        src="/Mongolia_Map2.svg"
        alt="Mongolia map"
        className="w-full h-auto block dark:invert dark:brightness-[0.6] dark:contrast-125"
        draggable={false}
      />

      {/* Overlay SVG for dots and glows */}
      <svg
        viewBox="0 0 1000 481"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Radial glow for hotspots */}
          {DASHBOARD_REGIONS.map((r) => (
            <radialGradient key={`grad-${r.name.en}`} id={`glow-${r.name.en}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ED1B24" stopOpacity={GLOW_OPACITY[r.density] * 1.8} />
              <stop offset="60%" stopColor="#ED1B24" stopOpacity={GLOW_OPACITY[r.density] * 0.5} />
              <stop offset="100%" stopColor="#ED1B24" stopOpacity="0" />
            </radialGradient>
          ))}

          {/* Pulse animations per density tier */}
          <style>{`
            @keyframes pulseHighest {
              0% { r: 11; opacity: 0.4; }
              70% { opacity: 0.06; }
              100% { r: 32; opacity: 0; }
            }
            @keyframes pulseHigh {
              0% { r: 9; opacity: 0.35; }
              70% { opacity: 0.06; }
              100% { r: 24; opacity: 0; }
            }
            .pulse-highest {
              animation: pulseHighest 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .pulse-high {
              animation: pulseHigh 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          `}</style>
        </defs>

        {/* Soft radial glow per region */}
        {DASHBOARD_REGIONS.map((r) => (
          <circle
            key={`glow-${r.name.en}`}
            cx={r.cx}
            cy={r.cy}
            r={GLOW_R[r.density]}
            fill={`url(#glow-${r.name.en})`}
          />
        ))}

        {/* Animated pulse ring for high-density areas */}
        {DASHBOARD_REGIONS.map((r) => {
          if (r.density !== 'highest' && r.density !== 'high') return null;
          return (
            <circle
              key={`pulse-${r.name.en}`}
              cx={r.cx}
              cy={r.cy}
              r={7}
              fill="none"
              stroke="#ED1B24"
              strokeWidth={1}
              className={r.density === 'highest' ? 'pulse-highest' : 'pulse-high'}
            />
          );
        })}

        {/* Solid center dots */}
        {DASHBOARD_REGIONS.map((r) => (
          <circle
            key={`dot-${r.name.en}`}
            cx={r.cx}
            cy={r.cy}
            r={DOT_R[r.density]}
            fill="#ED1B24"
            opacity={r.density === 'low' ? 0.6 : 0.9}
          />
        ))}
      </svg>
    </div>
  );
};
