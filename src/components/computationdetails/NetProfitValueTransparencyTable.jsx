import React, { useMemo } from 'react';
import { DollarSign, Info } from 'lucide-react';
import { OIL_DATA } from '../../data/oilData';
import { calculateCrudeMetrics } from '../../utils/pricingModel';

const NetProfitValueTransparencyTable = ({ marketPrice, data }) => {
  const tableRows = useMemo(() => {
    // Use provided data or fallback to local calculation
    const sourceData = data || OIL_DATA.map(c => ({
      ...c,
      ...calculateCrudeMetrics(c, marketPrice)
    }));

    // Sort to match OIL_DATA order
    return [...sourceData].sort((a, b) => {
      const indexA = OIL_DATA.findIndex(o => o.country === a.country);
      const indexB = OIL_DATA.findIndex(o => o.country === b.country);
      return indexA - indexB;
    });
  }, [data, marketPrice]);

  return (
    <div className="mt-12 pt-12 border-t border-slate-800/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <DollarSign className="text-emerald-400" size={24} />
        </div>
        <h3 className="text-xl font-bold bg-linear-to-r from-emerald-100 to-slate-400 bg-clip-text text-transparent">
          Net Profit Value Transparency Table
        </h3>
      </div>

      <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/50 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300">Net Profit Calculation (Historical Data Model)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          This table shows the final <strong>Net Profit Value</strong> using historical pricing relationships.
          <br /><br />
          1. <strong>Adjusted Price:</strong> <code className="text-emerald-300">adjPrice = HistoricalLookup(currentBrent)</code>
          <br />
          2. <strong>Net Profit/Bbl:</strong> <code className="text-emerald-300">netProfit = adjPrice - liftingCost</code>
          <br />
          3. <strong>Total Value:</strong> <code className="text-emerald-300">value = (capacity × netProfit) / 1000</code> (Trillions USD)
          <br />
          <span className="text-amber-400 text-[10px] italic mt-2 block">Note: Prices are interpolated from historical data.</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-[10px]">
          <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-2 py-3">Country</th>
              <th className="px-2 py-3">Grade</th>
              <th className="px-2 py-3">Capacity (B bbl)</th>
              <th className="px-2 py-3">Adj. Price</th>
              <th className="px-2 py-3">Lifting Cost</th>
              <th className="px-2 py-3">Net Profit/Bbl</th>
              <th className="px-2 py-3">Source</th>
              <th className="px-2 py-3 text-right">Net Profit Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tableRows.map((country) => {
              const baseCountry = OIL_DATA.find(c => c.country === country.country);
              
              const isLiftingCostOverridden = baseCountry && country.liftingCost !== baseCountry.liftingCost;
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
                  <td className="px-2 py-3 font-bold text-slate-200">{country.country}</td>
                  <td className="px-2 py-3 text-[9px] text-slate-500 uppercase">{country.grade}</td>
                  <td className="px-2 py-3 font-mono text-slate-400">{country.capacity}</td>
                  <td className={`px-2 py-3 font-mono ${
                    isManualOverride
                      ? 'text-emerald-300 font-bold'
                      : isHistoricalSnapshot
                        ? 'text-amber-300 font-bold'
                        : 'text-slate-200'
                  }`}>
                    ${country.currentAdjPrice.toFixed(2)}
                  </td>
                  <td className={`px-2 py-3 font-mono ${isLiftingCostOverridden ? 'text-emerald-300 font-bold' : 'text-red-400/80'}`}>
                    ${country.liftingCost.toFixed(2)}
                  </td>
                  <td className={`px-2 py-3 font-mono font-bold ${country.netProfitPerBbl > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                    ${country.netProfitPerBbl.toFixed(2)}
                  </td>
                  <td className="px-2 py-3">
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
                  <td className="px-2 py-3 text-right font-mono font-bold text-emerald-400">
                    ${Math.round(country.totalNetValue)}T
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

export default NetProfitValueTransparencyTable;
