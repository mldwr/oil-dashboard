import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
  Dot
} from 'recharts';
import { ArrowRightLeft } from 'lucide-react';

const BumpChart = ({
  bumpChartData,
  OIL_DATA,
  BumpTooltip,
  CustomXAxisTick,
  CustomYAxisTick,
  RenderFlagDot
}) => {
  return (
    <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2"><ArrowRightLeft className="text-blue-400" /> The Hierarchy Shift: Volume vs. Operating Profit</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] text-slate-400 uppercase font-bold">Light</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-[10px] text-slate-400 uppercase font-bold">Medium</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-stone-600"></div><span className="text-[10px] text-slate-400 uppercase font-bold">Heavy</span></div>
        </div>
      </div>

      <div className="w-full relative">
        <ResponsiveContainer width="100%" height={460}>
          <ComposedChart
            data={bumpChartData}
            // Margins tuned to prevent clipping while keeping X-axis icons tight
            margin={{ top: 25, right: 50, left: 80, bottom: 40 }}
          >
            <XAxis
              dataKey="step"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              padding={{ left: 30, right: 30 }}
              tick={CustomXAxisTick}
            />
            <YAxis
              reversed
              domain={[0.5, 10.5]}
              padding={{ top: 10, bottom: 10 }}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              tick={CustomYAxisTick}
            />
            <Tooltip content={BumpTooltip} />
            <defs>
              <linearGradient id="shine-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="50%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            {OIL_DATA.map((d) => (
              <React.Fragment key={d.country}>
                <Area
                  type="monotone"
                  dataKey={`${d.country}_ribbon`}
                  stroke={d.color}
                  fill={d.color}
                  fillOpacity={0.5}
                  strokeWidth={1}
                  connectNulls
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey={d.country}
                  stroke="transparent"
                  strokeWidth={0}
                  dot={RenderFlagDot}
                  activeDot={<Dot r={0} />}
                />
              </React.Fragment>
            ))}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Watermark - Bottom Left Corner */}
        <div className="absolute -bottom-4 -left-4 flex flex-col items-center gap-1 opacity-80 pointer-events-none select-none">
          <img
            src="/orange_goose_logo.png"
            alt="Orange Goose Analytics"
            className="w-20 h-20 object-contain"
          />
          <span className="text-xs font-medium text-slate-300 tracking-wide">
            Orange Goose Analytics
          </span>
        </div>

        {/* Data Source Attribution - Bottom Right Corner */}
        <div className="absolute -bottom-4 -right-2 opacity-70 pointer-events-none select-none">
          <span className="text-[8px] font-light text-slate-400 tracking-wider uppercase">
            Sources: OPEC, Oilprice.com, Statista
          </span>
        </div>
      </div>
    </div>
  );
};

export default BumpChart;
