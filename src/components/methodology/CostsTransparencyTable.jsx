import React from 'react';
import { Database, Info } from 'lucide-react';
import { OIL_DATA } from '../../data/oilData';

const CostsTransparencyTable = () => {
  const getCostStyle = (cost) => {
    if (cost < 15) return { text: 'text-emerald-400', bg: 'bg-emerald-950/10' };
    if (cost < 30) return { text: 'text-amber-400', bg: 'bg-amber-950/10' };
    return { text: 'text-red-400', bg: 'bg-red-950/10' };
  };

  return (
    <div className="mt-12 pt-12 border-t border-slate-800/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Database className="text-orange-400" size={24} />
        </div>
        <h3 className="text-xl font-bold bg-linear-to-r from-orange-100 to-slate-400 bg-clip-text text-transparent">
          Lifting Costs Transparency Table
        </h3>
      </div>

      <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/50 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-orange-400" />
          <span className="text-xs font-bold text-orange-300">Lifting Cost (OPEX-only)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Values represent <strong>operational expenditure (OPEX)</strong> only (lifting cost), excluding Capital Expenditure (CAPEX) for new project development. This view focuses on profitability from existing production, not the cost of establishing new fields or capacity.
          <br /><br />
          Source notes show the Statista 2015 CAPEX+OPEX breakdown for context, but only OPEX is used in the table and calculations. These 2015 OPEX figures are not inflation-adjusted and do not capture basin-specific productivity shifts.
          <br /><br />
          <strong>Source:</strong> Statista 2015 cost breakdowns (OPEX component). <a href="https://www.statista.com/statistics/597669/cost-breakdown-of-producing-one-barrel-of-oil-in-the-worlds-leading-oil-producing-countries/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Source Data</a>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[560px] text-left text-[10px]">
          <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3 text-right">Lifting Cost 2015($/bbl)</th>
              <th className="px-3 py-3">Source Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {[...OIL_DATA].sort((a, b) => a.liftingCost - b.liftingCost).map((oil) => {
              const style = getCostStyle(oil.liftingCost);
              return (
                <tr key={oil.country} className={`hover:bg-slate-800/30 ${style.bg}`}>
                  <td className="px-3 py-3 font-bold text-slate-200">{oil.country}</td>
                  <td className="px-3 py-3 text-right font-mono text-slate-300">
                    {typeof oil.liftingCost === 'number' ? `$${oil.liftingCost.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    <div className="space-y-1">
                      <div>{oil.extractionJustification}</div>
                    </div>
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

export default CostsTransparencyTable;
