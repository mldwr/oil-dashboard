import React, { useState, useMemo, Suspense } from 'react';
/* Remove the focus outline from Recharts components globally */
const GLOBAL_CHART_STYLES = `
  .recharts-wrapper:focus,
  .recharts-surface:focus {
    outline: none !important;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

import BumpChart from './components/BumpChart';
import ParameterControlPanel from './components/ParameterControlPanel';
import MarketPriceSlider from './components/MarketPriceSlider';
import HistoricalPriceSlider from './components/HistoricalPriceSlider';
import { OIL_DATA } from './data/oilData';
import { BASELINE_BRENT, calculateAdjustedPrice, calculateCrudeMetrics } from './utils/pricingModel';

import FlagSphere from './components/FlagSphere';
import GradeBadge from './components/GradeBadge';

// Larger, below-the-fold sections (and their heavy chart libraries) are
// code-split with React.lazy so they do not ship in the initial payload.
const ComputationDetails = React.lazy(() => import('./components/ComputationDetails'));
const HistoricalChart = React.lazy(() => import('./components/HistoricalChart'));
const ProfitSensitivityChart = React.lazy(() => import('./components/ProfitSensitivityChart'));
const WorldOilMap = React.lazy(() => import('./components/WorldOilMap'));
const MarginAnalysisChart = React.lazy(() => import('./components/MarginAnalysisChart'));
const Disclaimer = React.lazy(() => import('./components/Disclaimer'));
const KeyAnalysisInsights = React.lazy(() => import('./components/KeyAnalysisInsights'));
const MethodologySection = React.lazy(() => import('./components/MethodologySection'));

// Keep layout stable while a lazy chunk loads.
const SECTION_FALLBACK = (
  <div className="min-h-16 bg-slate-900/40 rounded-lg animate-pulse" aria-hidden="true" />
);


const COUNTRY_FLAGS = {
  "Saudi Arabia": "🇸🇦",
  "Venezuela": "🇻🇪",
  "Iran": "🇮🇷",
  "Iraq": "🇮🇶",
  "UAE": "🇦🇪",
  "Canada": "🇨🇦",
  "Kuwait": "🇰🇼",
  "Russia": "🇷🇺",
  "Libya": "🇱🇾",
  "USA": "🇺🇸"
};

const HISTORICAL_COLUMN_BY_COUNTRY = {
  "Saudi Arabia": "Saudi (Arab Lt)",
  "UAE": "UAE (Murban)",
  "Libya": "Libya (Es Sider)",
  "Iran": "Iran (Light)",
  "USA": "USA (WTI)",
  "Iraq": "Iraq (Basrah M)",
  "Kuwait": "Kuwait (Exp)",
  "Russia": "Russia (Urals)",
  "Canada": "Canada (WCS)",
  "Venezuela": "Venezuela (Merey)"
};

const CustomYAxisTick = ({ x, y, payload }) => {
  if (x === undefined || y === undefined) return null;
  const initialList = [...OIL_DATA].sort((a, b) => b.capacity - a.capacity);
  const country = initialList[payload.value - 1];

  if (!country) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-10} y={0} textAnchor="end">
        <tspan x={-10} dy="-0.1em" fontSize="9" fontWeight="bold" fill="#e2e8f0">
          {country.country}
        </tspan>
        <tspan x={-10} dy="1.1em" fontSize="7" fontWeight="normal" fill="#64748b">
          {country.quality}
        </tspan>
      </text>
    </g>
  );
};

const STEP_ICONS = {
  'Physical Capacity': '🛢️',
  'Market Value': '💰',
  'Operating Profit Value': '📈',
};

const CustomXAxisTick = ({ x, y, payload }) => {
  if (x === undefined || y === undefined) return null;
  const icon = STEP_ICONS[payload.value];

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Step label */}
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="middle"
        fontSize={12}
        fontWeight="600"
        fill="#e2e8f0"
      >
        {payload.value}
      </text>

      {/* Emoji icon below label */}
      {icon && (
        <text
          x={0}
          y={20}
          dy={20}
          textAnchor="middle"
          fontSize={22}
        >
          {icon}
        </text>
      )}
    </g>
  );
};


const App = () => {
  const [marketPrice, setMarketPrice] = useState(Math.round(BASELINE_BRENT));
  const [countryOverrides, setCountryOverrides] = useState({});
  const [historicalSelectionKey, setHistoricalSelectionKey] = useState(null);

  const oilDataByCountry = useMemo(() => {
    return OIL_DATA.reduce((acc, d) => {
      acc[d.country] = d;
      return acc;
    }, {});
  }, []);

  const effectiveOilData = useMemo(() => {
    return OIL_DATA.map((d) => {
      const overrides = countryOverrides[d.country];
      if (!overrides) return d;
      return {
        ...d,
        ...overrides,
      };
    });
  }, [countryOverrides]);

  const applyHistoricalSelection = (entry) => {
    if (!entry) return;
    setHistoricalSelectionKey(entry.key);
    if (Number.isFinite(entry.brent)) {
      setMarketPrice(Math.round(entry.brent));
    }
    const overrides = Object.entries(HISTORICAL_COLUMN_BY_COUNTRY).reduce((acc, [country, column]) => {
      const value = entry.values?.[column];
      if (Number.isFinite(value)) {
        acc[country] = { adjustedPrice: Math.round(value), sourceType: 'historical-snapshot' };
      }
      return acc;
    }, {});
    setCountryOverrides(overrides);
  };

  const updateCountryOverride = (country, patch) => {
    setCountryOverrides((prev) => {
      const base = oilDataByCountry[country];
      const existing = prev[country] || {};
      const nextEntry = { ...existing, ...patch, sourceType: 'manual' };
      const baselineAdjusted = calculateAdjustedPrice(base, marketPrice);
      const sameAdjustedPrice = nextEntry.adjustedPrice === undefined || Math.abs(nextEntry.adjustedPrice - baselineAdjusted) < 0.01;
      const sameLiftingCost = nextEntry.liftingCost === undefined || nextEntry.liftingCost === base.liftingCost;
      const next = { ...prev };

      if (sameAdjustedPrice && sameLiftingCost) {
        delete next[country];
        return next;
      }

      if (sameAdjustedPrice) delete nextEntry.adjustedPrice;
      if (sameLiftingCost) delete nextEntry.liftingCost;
      next[country] = nextEntry;
      return next;
    });
  };

  const resetAllCountryOverrides = () => {
    setCountryOverrides({});
    setHistoricalSelectionKey(null);
  };

  const calculatedData = useMemo(() => {
    return OIL_DATA.map(d => {
      const overrides = countryOverrides[d.country];
      const effective = overrides ? { ...d, ...overrides } : d;
      const metrics = calculateCrudeMetrics(effective, marketPrice);
      return {
        ...effective,
        ...metrics,
      };
    }).sort((a, b) => b.totalNetValue - a.totalNetValue);
  }, [marketPrice, countryOverrides]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-white mb-1 flex items-center justify-between gap-4">
            {label} <GradeBadge grade={data.grade} />
          </p>
          <p className="text-blue-400">Capacity: {Math.round(data.capacity)}B bbl</p>
          <p className="text-green-400">Operating Net Value: ${Math.round(data.totalNetValue)}T</p>
          <p className="text-slate-400">Lifting Cost ($/bbl): ${Math.round(data.liftingCost)}</p>
        </div>
      );
    }
    return null;
  };

  const BumpTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Consolidate entries by country to avoid duplicates and handle ribbons
      const countryMap = new Map();

      payload.forEach(entry => {
        const rawName = entry.name || "";
        const countryName = rawName.replace('_ribbon', '');
        const countryData = OIL_DATA.find(o => o.country === countryName);

        if (!countryMap.has(countryName) || !rawName.includes('_ribbon')) {
          countryMap.set(countryName, {
            ...entry,
            name: countryName,
            color: countryData?.color || entry.color,
            // Ensure we use the numeric value for sorting
            sortValue: Array.isArray(entry.value) ? entry.value[0] : entry.value
          });
        }
      });

      const sortedPayload = Array.from(countryMap.values())
        .filter(entry => entry.name)
        .sort((a, b) => a.sortValue - b.sortValue);

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-[11px] max-h-64 overflow-y-auto scrollbar-hide">
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          <p className="font-bold text-white mb-2 border-b border-slate-700 pb-1">{label} Details</p>
          {sortedPayload.map((entry, index) => {
            const countryName = entry.name;
            const values = entry.payload.rawValues?.[countryName];

            let displayVal = "";
            if (label === "Physical Capacity") displayVal = `${Math.round(values?.capacity)}B bbl`;
            else if (label === "Market Value") displayVal = `$${Math.round(values?.grossValue)}T`;
            else displayVal = `$${Math.round(values?.totalNetValue)}T`;

            return (
              <div key={index} className="flex justify-between gap-4 mb-1">
                <span style={{ color: entry.color }}>{countryName}:</span>
                <span className="font-mono text-slate-300">{displayVal}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const RenderFlagDot = (props) => {
    const { cx, cy, dataKey, payload } = props;
    if (cx === undefined || cy === undefined) return null;
    const countryData = OIL_DATA.find(o => o.country === dataKey);
    const percentage = payload?.percentages?.[dataKey];

    return (
      <g>
        <FlagSphere
          countryCode={countryData.code}
          cx={cx}
          cy={cy}
          r={24}
          isHovered={false}
          variant="rect"
        />
        {percentage && (
          <text
            x={cx + 28}
            y={cy + 3}
            fontSize="10"
            fill="#f8fafc"
            fontWeight="700"
            className="font-mono"
            style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }}
          >
            {percentage}
          </text>
        )}
      </g>
    );
  };

  const bumpChartData = useMemo(() => {
    const getRank = (list, key, country) => [...list].sort((a, b) => b[key] - a[key]).findIndex(x => x.country === country) + 1;
    const getShare = (val, total) => (val / total) * 100;

    // Convert percentage share to ribbon width in Y-axis units (Rank)
    // 0.05 units is ~2.3px, 0.35 units is ~16px in a 460px height chart with 11 units
    const getRibbonWidth = (share) => {
      const minW = 0.05;
      const maxW = 0.35;
      const maxShare = 20; // 20% or more gets the maximum width
      return minW + (Math.min(share, maxShare) / maxShare) * (maxW - minW);
    };

    const totalCapacity = OIL_DATA.reduce((sum, d) => sum + d.capacity, 0);
    const totalGrossValue = calculatedData.reduce((sum, d) => sum + d.grossValue, 0);
    const totalNetValue = calculatedData.reduce((sum, d) => sum + d.totalNetValue, 0);

    const rawValues = calculatedData.reduce((acc, curr) => {
      acc[curr.country] = {
        capacity: curr.capacity,
        grossValue: curr.grossValue,
        totalNetValue: curr.totalNetValue
      };
      return acc;
    }, {});

    const countriesByInitialRank = [...OIL_DATA].sort((a, b) => b.capacity - a.capacity).map(c => c.country);

    return [
      {
        step: "Physical Capacity",
        rawValues,
        countriesByInitialRank,
        percentages: calculatedData.reduce((acc, curr) => ({
          ...acc,
          [curr.country]: Math.round((curr.capacity / totalCapacity) * 100) + "%"
        }), {}),
        ...calculatedData.reduce((acc, curr) => {
          const rank = getRank([...OIL_DATA], 'capacity', curr.country);
          const w = getRibbonWidth(getShare(curr.capacity, totalCapacity));
          return {
            ...acc,
            [curr.country]: rank,
            [`${curr.country}_ribbon`]: [rank - w / 2, rank + w / 2]
          };
        }, {})
      },
      {
        step: "Market Value",
        rawValues,
        percentages: calculatedData.reduce((acc, curr) => ({
          ...acc,
          [curr.country]: Math.round((curr.grossValue / totalGrossValue) * 100) + "%"
        }), {}),
        ...calculatedData.reduce((acc, curr) => {
          const rank = getRank([...calculatedData], 'grossValue', curr.country);
          const w = getRibbonWidth(getShare(curr.grossValue, totalGrossValue));
          return {
            ...acc,
            [curr.country]: rank,
            [`${curr.country}_ribbon`]: [rank - w / 2, rank + w / 2]
          };
        }, {})
      },
      {
        step: "Operating Profit Value",
        rawValues,
        percentages: calculatedData.reduce((acc, curr) => ({
          ...acc,
          [curr.country]: Math.round((curr.totalNetValue / totalNetValue) * 100) + "%"
        }), {}),
        ...calculatedData.reduce((acc, curr) => {
          const rank = getRank([...calculatedData], 'totalNetValue', curr.country);
          const w = getRibbonWidth(getShare(curr.totalNetValue, totalNetValue));
          return {
            ...acc,
            [curr.country]: rank,
            [`${curr.country}_ribbon`]: [rank - w / 2, rank + w / 2]
          };
        }, {})
      },
    ];
  }, [calculatedData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <style>{GLOBAL_CHART_STYLES}</style>
      <div className="max-w-7xl mx-auto relative flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <a
          href="https://orange-goose.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Orange Goose"
          className="absolute right-0 top-0"
        >
          <img
            src="/orange_goose_logo.png"
            alt="Orange Goose"
            className="h-7 sm:h-9 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
        </a>
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Global Oil Reservoir Value Dashboard
          </h1>
          <p className="text-slate-400 mt-1">From Geological Assets to OPEX-Only Net Operating Profit</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BumpChart
            bumpChartData={bumpChartData}
            OIL_DATA={OIL_DATA}
            BumpTooltip={BumpTooltip}
            CustomXAxisTick={CustomXAxisTick}
            CustomYAxisTick={CustomYAxisTick}
            RenderFlagDot={RenderFlagDot}
          />

          <MarketPriceSlider 
            marketPrice={marketPrice} 
            setMarketPrice={setMarketPrice} 
            resetAllCountryOverrides={resetAllCountryOverrides} 
          />

          <HistoricalPriceSlider
            selectedKey={historicalSelectionKey}
            onSelectionChange={applyHistoricalSelection}
          />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <ParameterControlPanel
            oilData={OIL_DATA}
            overrides={countryOverrides}
            brentPrice={marketPrice}
            onChangeCountryParameter={updateCountryOverride}
            onResetAll={resetAllCountryOverrides}
          />
        </div>
      </div>

      <Suspense fallback={SECTION_FALLBACK}>
        <ComputationDetails marketPrice={marketPrice} data={calculatedData} />
      </Suspense>

      <Suspense fallback={SECTION_FALLBACK}>
        <HistoricalChart countryFlags={COUNTRY_FLAGS} />
      </Suspense>

      <Suspense fallback={SECTION_FALLBACK}>
        <ProfitSensitivityChart oilData={effectiveOilData} countryFlags={COUNTRY_FLAGS} />
      </Suspense>

      <Suspense fallback={SECTION_FALLBACK}>
        <WorldOilMap calculatedData={calculatedData} countryFlags={COUNTRY_FLAGS} />
      </Suspense>

      <Suspense fallback={SECTION_FALLBACK}>
        <MarginAnalysisChart calculatedData={calculatedData} CustomTooltip={CustomTooltip} />
      </Suspense>
      
      <Suspense fallback={SECTION_FALLBACK}>
        <Disclaimer />
      </Suspense>

      <Suspense fallback={SECTION_FALLBACK}>
        <KeyAnalysisInsights calculatedData={calculatedData} marketPrice={marketPrice} />
      </Suspense>

      <Suspense fallback={SECTION_FALLBACK}>
        <MethodologySection marketPrice={marketPrice} />
      </Suspense>

      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 text-center text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">
        Oil Valuation Dashboard • 2026 Orange Goose Analytics • All rights reserved
      </footer>
    </div>
  );
};

export default App;
