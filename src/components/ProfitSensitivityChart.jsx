import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { calculateCrudeMetrics } from '../utils/pricingModel';



const ProfitSensitivityTooltip = ({ active, payload, label, countryFlags }) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-white mb-2 border-b border-slate-700 pb-1">
          Brent Price: ${label}/bbl
        </p>
        <div className="space-y-1">
          {sortedPayload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span>{countryFlags[entry.name]}</span>
                <span style={{ color: entry.color }}>{entry.name}</span>
              </div>
              <span className="font-mono text-slate-300">
                ${entry.value.toFixed(1)}T
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


const ProfitSensitivityChart = ({ oilData, countryFlags }) => {
  const chartData = useMemo(() => {
    const result = [];
    const startPrice = 57.61;
    const endPrice = 130.51;
    
    // Add start point
    let currentPrice = startPrice;
    
    // Generate points every $5, aligned to integers where possible for smoothness
    // We'll just step by 2.5 to get a smooth curve over this ~73 range
    while (currentPrice <= endPrice) {
      const dataPoint = { price: Number(currentPrice.toFixed(2)) };
      oilData.forEach(country => {
        const metrics = calculateCrudeMetrics(country, currentPrice);
        dataPoint[country.country] = metrics.totalNetValue;
      });
      result.push(dataPoint);
      currentPrice += 2.5;
    }
    
    // Ensure exact end point is included if not covered
    if (result[result.length - 1].price < endPrice) {
      const dataPoint = { price: endPrice };
      oilData.forEach(country => {
        const metrics = calculateCrudeMetrics(country, endPrice);
        dataPoint[country.country] = metrics.totalNetValue;
      });
      result.push(dataPoint);
    }
    
    return result;
  }, [oilData]);


  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>{countryFlags[entry.value]}</span>
            <span style={{ color: entry.color }} className="font-medium">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Operating Profit Sensitivity Analysis</h2>
            <p className="text-sm text-slate-400">Operating Profit Value (Trillions USD) vs. Brent Market Price</p>
          </div>
        </div>
        <div className="mb-6 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-200 mb-1">How operating profit value is computed</div>
          <div className="space-y-1">
            <div>1. Adjusted Price: <span className="text-emerald-300 font-mono">adjPrice = HistoricalLookup(brentPrice)</span> <span className="text-slate-500 italic">(Interpolated)</span></div>
            <div>2. Net Profit / Bbl: <span className="text-emerald-300 font-mono">netProfit = adjPrice − liftingCost</span></div>
            <div>3. Operating Profit Value (T): <span className="text-emerald-300 font-mono">totalNetValue = (capacity × netProfit) / 1000</span></div>
          </div>
          <div className="mt-2 text-slate-500">This chart uses OPEX-only net profit, not gross market value.</div>
        </div>

        <div className="overflow-x-auto mb-8">
        <div className="h-100 w-full min-w-[560px]">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis 
                dataKey="price" 
                type="number"
                domain={[57.61, 130.51]}
                ticks={[60, 70, 80, 90, 100, 110, 120, 130]}
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                label={{ value: 'Brent Market Price ($/bbl)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
                height={50}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `$${value}T`}
                label={{ value: 'Operating Profit Value ($ Trillions)', angle: -90, position: 'insideLeft', dy: 100, fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={(props) => <ProfitSensitivityTooltip {...props} countryFlags={countryFlags} />} />
              <Legend content={renderLegend} />
              
            

              {[...oilData].sort((a, b) => {
                if (a.country === 'Venezuela') return 1;
                if (b.country === 'Venezuela') return -1;
                return 0;
              }).map((country) => (
                <Line
                  key={country.country}
                  type="monotone"
                  dataKey={country.country}
                  stroke={country.color}
                  strokeWidth={country.country === 'Venezuela' ? 4 : 1.5}
                  strokeOpacity={country.country === 'Venezuela' ? 1 : 0.4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        </div>


      </div>
    </div>
  );
};

export default ProfitSensitivityChart;
