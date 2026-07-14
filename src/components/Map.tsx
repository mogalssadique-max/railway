import React from 'react';
import { INDIAN_STATIONS, Station, Parcel } from '../data';
import { MapPin, Train } from 'lucide-react';

interface MapProps {
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  activeParcel: Parcel | null;
  darkMode: boolean;
}

export const Map: React.FC<MapProps> = ({
  selectedStation,
  onSelectStation,
  activeParcel,
  darkMode,
}) => {
  // Find station positions for drawing lines
  const getStationCoords = (name: string) => {
    const station = INDIAN_STATIONS.find(
      (s) => s.name.toLowerCase() === name.toLowerCase() || s.code.toLowerCase() === name.toLowerCase()
    );
    if (station) {
      return { x: station.x, y: station.y };
    }
    return null;
  };

  const pickupCoords = activeParcel ? getStationCoords(activeParcel.pickupStation) : null;
  const destCoords = activeParcel ? getStationCoords(activeParcel.destinationStation) : null;

  // Calculate current progress position of the parcel along the route
  const getProgressCoords = () => {
    if (!pickupCoords || !destCoords || !activeParcel) return null;
    let ratio = 0.1; // Booked
    if (activeParcel.status === 'Dispatched') ratio = 0.35;
    else if (activeParcel.status === 'In Transit') ratio = 0.6;
    else if (activeParcel.status === 'Out For Delivery') ratio = 0.85;
    else if (activeParcel.status === 'Delivered') ratio = 1.0;

    return {
      x: pickupCoords.x + (destCoords.x - pickupCoords.x) * ratio,
      y: pickupCoords.y + (destCoords.y - pickupCoords.y) * ratio,
    };
  };

  const trainProgressCoords = getProgressCoords();

  return (
    <div id="interactive-map-container" className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-4 shadow-sm transition-colors duration-300">
      {/* Title Header inside map */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs pointer-events-none">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Train className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Interactive Railway Cargo Map
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Click station nodes to inspect hub traffic
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
          <span>Railway Junction Hub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span>Active Cargo Activity</span>
        </div>
        {activeParcel && (
          <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
            <span className="w-3.5 h-0.5 border-t border-dashed border-amber-500 block"></span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              Active Transit Route
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas Map */}
      <svg
        id="railway-svg-map"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      >
        {/* Geographic grid helper lines */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke={darkMode ? '#1e293b' : '#f1f5f9'}
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Major railway lines (background tracks) */}
        <path
          d="M 42 22 L 20 62 L 40 85 M 42 22 L 78 45 L 50 88 M 42 22 L 45 65 L 50 88 M 20 62 L 25 68 M 40 85 L 50 88 M 78 45 L 68 32 L 42 22 M 20 62 L 18 48 L 42 22 M 45 65 L 52 68 L 50 88"
          fill="none"
          stroke={darkMode ? '#334155' : '#e2e8f0'}
          strokeWidth="0.75"
          strokeDasharray="1.5,1"
        />

        {/* Selected Route Tracking Line (Glow effect) */}
        {pickupCoords && destCoords && (
          <>
            <line
              x1={pickupCoords.x}
              y1={pickupCoords.y}
              x2={destCoords.x}
              y2={destCoords.y}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-pulse"
              strokeDasharray="2,2"
            />
            {/* Start point marker */}
            <circle
              cx={pickupCoords.x}
              cy={pickupCoords.y}
              r="2.5"
              fill="#3b82f6"
              className="animate-ping opacity-70"
            />
            {/* End point marker */}
            <circle
              cx={destCoords.x}
              cy={destCoords.y}
              r="2.5"
              fill="#ef4444"
              className="animate-ping opacity-70"
            />
          </>
        )}

        {/* Active station markers */}
        {INDIAN_STATIONS.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const isPickup = activeParcel?.pickupStation.toLowerCase() === station.name.toLowerCase();
          const isDest = activeParcel?.destinationStation.toLowerCase() === station.name.toLowerCase();
          
          let circleColor = 'fill-blue-600 dark:fill-blue-400';
          let strokeColor = 'stroke-white dark:stroke-slate-900';
          let radius = 1.6;

          if (isSelected) {
            circleColor = 'fill-orange-500';
            radius = 2.4;
          } else if (isPickup) {
            circleColor = 'fill-blue-500';
            radius = 2.0;
          } else if (isDest) {
            circleColor = 'fill-red-500';
            radius = 2.0;
          }

          return (
            <g
              key={station.id}
              onClick={() => onSelectStation(station)}
              className="cursor-pointer group transition-all"
            >
              <circle
                cx={station.x}
                cy={station.y}
                r={radius}
                className={`${circleColor} ${strokeColor} transition-all duration-300 hover:r-3`}
                strokeWidth="0.5"
              />
              <text
                x={station.x}
                y={station.y - 3}
                textAnchor="middle"
                className="text-[2.2px] font-bold fill-slate-700 dark:fill-slate-300 tracking-wider pointer-events-none select-none transition-all group-hover:text-[2.8px] group-hover:fill-orange-500"
              >
                {station.code}
              </text>
            </g>
          );
        })}

        {/* Moving Train representation along path */}
        {trainProgressCoords && (
          <g className="animate-bounce">
            <circle
              cx={trainProgressCoords.x}
              cy={trainProgressCoords.y}
              r="1.8"
              fill="#f59e0b"
              className="stroke-amber-800 dark:stroke-amber-400"
              strokeWidth="0.4"
            />
            <path
              d={`M ${trainProgressCoords.x - 1} ${trainProgressCoords.y - 1} L ${trainProgressCoords.x + 1} ${trainProgressCoords.y - 1}`}
              stroke="#ffffff"
              strokeWidth="0.3"
            />
          </g>
        )}
      </svg>

      {/* Floating Panel for Station details when clicked */}
      {selectedStation && (
        <div id="station-info-panel" className="absolute top-16 right-4 z-10 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3 text-xs animate-fade-in">
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <h5 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                {selectedStation.name}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Code: {selectedStation.code} | {selectedStation.state}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Close station info via clicking or custom close
                const closeBtn = document.getElementById('station-info-panel');
                if (closeBtn) closeBtn.style.display = 'none';
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold px-1"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span>Daily Freight Trains:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">14 Trains</span>
            </div>
            <div className="flex justify-between">
              <span>Station Hub Status:</span>
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-md font-medium">
                Operational
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cargo Volume Today:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">1,420+ Bags</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 italic text-center">
            Logistics hub serving {selectedStation.state} region.
          </p>
        </div>
      )}
    </div>
  );
};
