import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import historicOilDataCsv from '../data/historic_oildata.csv?raw';
import { OIL_DATA } from '../data/oilData';

const SERIES_CONFIG = [
  { key: 'Brent', label: 'Brent', color: '#38bdf8', emphasis: true },
  { key: 'Saudi (Arab Lt)', country: 'Saudi Arabia' },
  { key: 'UAE (Murban)', country: 'UAE' },
  { key: 'Libya (Es Sider)', country: 'Libya' },
  { key: 'Iran (Light)', country: 'Iran' },
  { key: 'USA (WTI)', country: 'USA' },
  { key: 'Iraq (Basrah M)', country: 'Iraq' },
  { key: 'Kuwait (Exp)', country: 'Kuwait' },
  { key: 'Russia (Urals)', country: 'Russia' },
  { key: 'Canada (WCS)', country: 'Canada' },
  { key: 'Venezuela (Merey)', country: 'Venezuela' }
];

const parseHistoricOilData = (rawCsv) => {
  const lines = rawCsv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const parts = line.split(',');
    const entry = {};
    headers.forEach((header, index) => {
      if (header === 'Month') {
        entry[header] = parts[index];
      } else {
        const value = Number(parts[index]);
        entry[header] = Number.isFinite(value) ? value : null;
      }
    });
    return entry;
  });
};

const HistoricalChart = ({ countryFlags }) => {
  const countryColorMap = useMemo(() => {
    return OIL_DATA.reduce((acc, item) => {
      acc[item.country] = item.color;
      return acc;
    }, {});
  }, []);

  const data = useMemo(() => parseHistoricOilData(historicOilDataCsv), []);

  const tooltipFormatter = (value, name) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return [value, name];
    const series = SERIES_CONFIG.find((item) => item.key === name);
    const flag = series?.country ? countryFlags[series.country] : '';
    const label = flag ? `${flag} ${name}` : name;
    return [`$${numeric.toFixed(0)}`, label];
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry, index) => {
          const series = SERIES_CONFIG.find((item) => item.key === entry.value || item.label === entry.value);
          const label = series?.country || entry.value;
          const flag = series?.country ? countryFlags[series.country] : '';
          return (
            <div key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>{flag}</span>
              <span style={{ color: entry.color }} className="font-medium">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto mt-8">
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="text-cyan-400" /> Historical Price Series (Monthly Averages)
        </h2>
        <div className="mb-6 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-200 mb-1">How monthly averages are computed</div>
          <div className="space-y-1">
            <div>1. Daily prices are grouped by month for each crude grade.</div>
            <div>2. Monthly Average: <span className="text-emerald-300 font-mono">monthlyAvg = Σ(dailyPrice) / N</span></div>
            <div>3. Each line plots monthlyAvg per grade on the shared timeline.</div>
          </div>
          <div className="mt-2 text-slate-500">Values are pre-aggregated in the historical dataset and rendered as time series.</div>
        </div>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={data} margin={{ top: 40, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="Month"
                stroke="#94a3b8"
                fontSize={10}
                label={{ value: 'Month', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickFormatter={(value) => `$${Math.round(value)}`}
                label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                position={{ y: 0 }}
                wrapperStyle={{ zIndex: 50 }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', opacity: 1 }}
                formatter={tooltipFormatter}
              />
              <Legend content={renderLegend} />
              {SERIES_CONFIG.map((series) => {
                const color = series.color || countryColorMap[series.country] || '#94a3b8';
                return (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label || series.key}
                    stroke={color}
                    strokeWidth={series.emphasis ? 3 : 1.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    opacity={series.emphasis ? 1 : 0.7}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;
