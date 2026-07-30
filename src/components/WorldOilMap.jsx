import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

// World map topology - embedded version to avoid external dependency
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Constants for color scale (cold → warm)
const MIN_COLOR = "#1d4ed8"; // Cold / Low - Deep Blue
const MID_COLOR = "#8b5cf6"; // Midpoint - Vivid Violet
const MAX_COLOR = "#ef4444"; // Warm / High - Bright Red
const EMPTY_COLOR = "#1e293b"; // Slate 800
const HOVER_COLOR = "#FFFF00"; // Bright Yellow (High Visibility)

// Text Colors (High Contrast)
const TEXT_PRIMARY = "text-white";
const TEXT_SECONDARY = "text-cyan-300";
const TEXT_HIGHLIGHT = "text-yellow-300";
const TEXT_MUTED = "text-cyan-100/70";

// Basic color helpers for RGB interpolation
const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  const num = parseInt(value, 16);
  if (Number.isNaN(num)) return [0, 0, 0];
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
  ];
};

const lerpChannel = (a, b, t) => Math.round(a + (b - a) * t);

const interpolateRgb = (startHex, endHex, t) => {
  const [r1, g1, b1] = hexToRgb(startHex);
  const [r2, g2, b2] = hexToRgb(endHex);

  const r = lerpChannel(r1, r2, t);
  const g = lerpChannel(g1, g2, t);
  const b = lerpChannel(b1, b2, t);

  return `rgb(${r}, ${g}, ${b})`;
};

// 3-stop blue → purple → red scale for net value
const getMapColor = (value, min, max) => {
  if (value == null) return EMPTY_COLOR;
  if (min === max) return interpolateRgb(MIN_COLOR, MAX_COLOR, 1);

  const clamped = Math.max(min, Math.min(value, max));
  const t = (clamped - min) / (max - min || 1);

  if (t <= 0.5) {
    // First half: blue → purple
    const localT = t / 0.5;
    return interpolateRgb(MIN_COLOR, MID_COLOR, localT);
  }

  // Second half: purple → red
  const localT = (t - 0.5) / 0.5;
  return interpolateRgb(MID_COLOR, MAX_COLOR, localT);
};

// Country name mapping (TopoJSON name -> Data name)
const geoNameMapping = {
  "United States of America": "USA",
  "United Arab Emirates": "UAE",
  "Russian Federation": "Russia",
  "Korea, Dem. People's Rep.": "North Korea",
  "Korea, Rep.": "South Korea",
  "Iran (Islamic Republic of)": "Iran",
  "Venezuela (Bolivarian Republic of)": "Venezuela",
  // Add others as needed based on mismatches
};

const WorldOilMap = ({ calculatedData, countryFlags }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Create a map for fast lookup: countryName -> data
  const dataMap = useMemo(() => {
    return calculatedData.reduce((acc, item) => {
      acc[item.country] = item;
      return acc;
    }, {});
  }, [calculatedData]);

  // Find min and max net values for scaling
  const { minNetValue, maxNetValue } = useMemo(() => {
    const values = calculatedData.map(d => d.totalNetValue);
    return {
      minNetValue: Math.min(...values),
      maxNetValue: Math.max(...values)
    };
  }, [calculatedData]);

  const handleMouseEnter = (geo) => {
    const geoName = geo.properties.name;
    const dataName = geoNameMapping[geoName] || geoName;
    const countryData = dataMap[dataName];

    setHoveredCountry(geoName);

    if (countryData) {
      const flag = countryFlags?.[countryData.country] || '';
      setTooltipContent(`
        <div class="bg-slate-900 border border-white/20 p-3 rounded-lg shadow-2xl text-sm backdrop-blur-md">
          <p class="font-bold text-white mb-2 border-b border-white/20 pb-1 text-base">${flag} ${countryData.country}</p>
          <div class="space-y-1.5">
            <div class="flex justify-between gap-6">
              <span class="text-cyan-300 font-medium">Net Value:</span>
              <span class="text-yellow-300 font-mono font-bold text-base">$${Math.round(countryData.totalNetValue)}T</span>
            </div>
            <div class="flex justify-between gap-6">
              <span class="text-cyan-300 font-medium">Capacity:</span>
              <span class="text-white font-mono">${Math.round(countryData.capacity)}B bbl</span>
            </div>
            <div class="flex justify-between gap-6">
              <span class="text-cyan-300 font-medium">Lifting Cost:</span>
              <span class="text-white font-mono">$${Math.round(countryData.liftingCost)}/bbl</span>
            </div>
          </div>
        </div>
      `);
    } else {
      const flag = countryFlags?.[dataName] || '';
      setTooltipContent(`
        <div class="bg-slate-900 border border-white/20 p-2 rounded shadow-xl text-xs backdrop-blur-md">
          <p class="text-white font-medium">${flag} ${geoName}</p>
        </div>
      `);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
    setTooltipContent('');
  };

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 relative">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">Global Oil Production Map</h2>
        <div className="relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 120 }}
            style={{ width: '100%', height: '400px' }}
          >
            <ZoomableGroup center={[-70, 30]} zoom={2.0}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const geoName = geo.properties.name;
                    const dataName = geoNameMapping[geoName] || geoName;
                    const countryData = dataMap[dataName];
                    
                    let fillColor = EMPTY_COLOR;
                    
                    if (countryData) {
                      fillColor = getMapColor(
                        countryData.totalNetValue,
                        minNetValue,
                        maxNetValue
                      );
                    }

                    const isHovered = hoveredCountry === geoName;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isHovered ? HOVER_COLOR : fillColor}
                        stroke="#475569"
                        strokeWidth={0.5}
                        onMouseEnter={() => handleMouseEnter(geo)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          default: { outline: "none", transition: "fill 0.3s ease" },
                          hover: { outline: "none", transition: "fill 0.1s ease", cursor: countryData ? "pointer" : "default" },
                          pressed: { outline: "none" }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          
          {/* Floating Tooltip */}
          {tooltipContent && (
            <div
              className="absolute top-0 left-0 bg-transparent pointer-events-none z-10"
              style={{
                left: '50%',
                top: '10px',
                transform: 'translateX(-50%)',
                width: '250px'
              }}
              dangerouslySetInnerHTML={{ __html: tooltipContent }}
            />
          )}
          
          {/* Enhanced Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/95 p-4 rounded-lg border border-white/20 backdrop-blur-md shadow-2xl">
            <div className="text-sm font-bold text-white mb-3">Net Economic Value</div>
            
            <div className="w-56 mb-2">
              <div className="h-4 w-full rounded-md overflow-hidden border border-white/10 bg-slate-800/40">
                <div
                  className="h-full w-full"
                  style={{ background: `linear-gradient(to right, ${MIN_COLOR}, ${MID_COLOR}, ${MAX_COLOR})` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-cyan-300 font-mono font-medium">
              <span>Low (${Math.round(minNetValue)}T)</span>
              <span>High (${Math.round(maxNetValue)}T)</span>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-slate-800 border border-slate-600"></div>
                  <span className="text-xs text-cyan-100/70 font-medium">No Data</span>
              </div>
              <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.3)]"></div>
                  <span className="text-xs text-white font-bold">Hover Selection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldOilMap;
