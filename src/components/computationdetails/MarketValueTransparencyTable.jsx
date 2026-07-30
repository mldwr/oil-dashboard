import React, { useMemo } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { OIL_DATA } from '../../data/oilData';
import { calculateCrudeMetrics } from '../../utils/pricingModel';

const MarketValueTransparencyTable = ({ marketPrice, data }) => {
  const tableRows = useMemo(() => {
    // If data is provided (from App.jsx), use it. It already has metrics calculated.
    // Otherwise fallback to local calculation (though App.jsx should always provide it now).
    const sourceData = data || OIL_DATA.map(c => ({
      ...c,
      ...calculateCrudeMetrics(c, marketPrice)
    }));

    // Sort to match the original OIL_DATA order (by grade/group)
    // instead of the Net Value sort from App.jsx
    return [...sourceData].sort((a, b) => {
      const indexA = OIL_DATA.findIndex(o => o.country === a.country);
      const indexB = OIL_DATA.findIndex(o => o.country === b.country);
      return indexA - indexB;
    });
  }, [data, marketPrice]);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <TrendingUp className="text-blue-400" size={24} />
        </div>
        <h3 className="text-xl font-bold bg-linear-to-r from-blue-100 to-slate-400 bg-clip-text text-transparent">
          Market Value Transparency Table
        </h3>
      </div>

      <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/50 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-blue-300">Historical Pricing Model</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          This table uses <strong className="text-emerald-400">historical data lookup</strong> to determine adjusted prices.
          Prices are interpolated from actual market history where available, or extrapolated linearly for extreme scenarios.
          <br /><br />
          <strong>Formula:</strong> <code className="text-blue-300">adjPrice = HistoricalLookup(currentBrent)</code>
          <br />
          • <strong>currentBrent:</strong> ${marketPrice}/bbl (User-Selected Scenario Price)
          <br />
          • <strong>Manual Overrides:</strong> If a price is manually set in the Control Panel, it overrides the historical model.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-[10px]">
          <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">Grade</th>
              <th className="px-3 py-3">Capacity (B bbl)</th>
              <th className="px-3 py-3">Adj. Price / Bbl</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3 text-right">Market Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tableRows.map((country) => {
              const sourceType = country.sourceType;
              const isManualOverride = sourceType === 'manual';
              const isHistoricalSnapshot = sourceType === 'historical-snapshot';
              const source = isManualOverride
                ? 'Manual Override'
                : isHistoricalSnapshot
                  ? 'Historical Snapshot'
                  : 'Brent Model';
              
              return (
                <tr key={country.country} className={`hover:bg-slate-800/30 ${isManualOverride ? 'bg-emerald-900/10' : ''}`}>
                  <td className="px-3 py-3 font-bold text-slate-200">{country.country}</td>
                  <td className="px-3 py-3 text-[9px] text-slate-500 uppercase">{country.grade}</td>
                  <td className="px-3 py-3 font-mono text-slate-400">{country.capacity}</td>
                  <td className={`px-3 py-3 font-mono ${
                    isManualOverride
                      ? 'text-emerald-300 font-bold'
                      : isHistoricalSnapshot
                        ? 'text-amber-300 font-bold'
                        : 'text-emerald-400'
                  }`}>
                    ${country.currentAdjPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold ${
                      isManualOverride 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isHistoricalSnapshot
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {source}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-blue-400">
                    ${Math.round(country.grossValue)}T
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketValueTransparencyTable;
