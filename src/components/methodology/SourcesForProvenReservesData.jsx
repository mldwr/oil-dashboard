import React from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { OIL_DATA } from '../../data/oilData';

const SourcesForProvenReservesData = () => {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <TrendingUp className="text-amber-400" size={24} />
        </div>
        <h3 className="text-xl font-bold bg-linear-to-r from-amber-100 to-slate-400 bg-clip-text text-transparent">
          Sources for Proven Reserves Data
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Proven Reserves Definition */}
        <div className="space-y-6">

          <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800/50">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500 mb-4">Core Citations (Last accessed: 2026-01-10)</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="text-[10px] text-slate-400 leading-tight border-l-2 border-slate-800 pl-3 py-1">
                <div className="font-bold text-slate-200 mb-1">OPEC Annual Statistical Bulletin (2025)</div>
                Primary source for all global reserves (Member & Non-Member nations).
                <span className="text-slate-500 block italic">Verification: Table 3.1 (World Proven Crude Oil Reserves)</span>
                <a href="https://www.opec.org/assets/assetdb/asb-2025.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-1">View Official PDF (Page 23)</a>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight border-l-2 border-slate-800 pl-3 py-1">
                <div className="font-bold text-slate-200 mb-1">Natural Resources Canada (NRCan)</div>
                Official authority for Canadian energy statistics.
                <span className="text-slate-500 block italic">Verification: 163B bbl Total (incl. 159B bbl Oil Sands)</span>
                <a href="https://natural-resources.canada.ca/energy-sources/fossil-fuels/crude-oil-industry-overview" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-1">View Canada Crude Oil Overview</a>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight border-l-2 border-slate-800 pl-3 py-1">
                <div className="font-bold text-slate-200 mb-1">Visual Capitalist (2026 Visualization)</div>
                Independent verification and mapping of the OPEC 2025 dataset, including oil sands and tight oil estimates.
                <a href="https://www.visualcapitalist.com/all-of-the-worlds-oil-reserves-by-country-in-one-visualization/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-1">View Visualization Analysis</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sources & Verification */}
        <div className="space-y-8">
          <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800/50">
            <h4 className="text-xs font-bold text-blue-300 mb-2 flex items-center gap-2">
              <Info size={14} />
              Manual Verification Guide (OPEC ASB 2025)
            </h4>
            <div className="space-y-2 text-[10px] text-slate-400 leading-relaxed">
              <p>To verify these values in <strong>Table 3.1 (Page 23) of the OPEC Annual Statistical Bulletin (2025)</strong>:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Canada</strong>: The main table entry (4,344 mb) specifically excludes <strong>Oil Sands</strong>. However, the total proven reserves including oil sands are acknowledged by OPEC and industry analysts at <strong>~163,440 mb (163.4B bbl)</strong>. We use this "Total" figure for realistic capacity assessment.</li>
              </ul>
              <p className="mt-2 text-slate-500 italic">Note: Divide million barrels (mb) by 1,000 to get billion barrels (B bbl) used here.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-6 rounded-xl border border-slate-800">
        <table className="w-full text-left text-[10px]">
          <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">Capacity (B bbl)</th>
              <th className="px-3 py-3">Selected Benchmark</th>
              <th className="px-3 py-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {['light', 'medium', 'heavy'].map(grade => 
              OIL_DATA.filter(oil => oil.grade === grade).map((oil, index) => {
                const styles = {
                  light: {
                    row: "bg-emerald-950/10",
                    quality: "text-emerald-400"
                  },
                  medium: {
                    row: "bg-amber-950/10",
                    quality: "text-amber-400"
                  },
                  heavy: {
                    row: "bg-stone-950/20",
                    quality: "text-stone-400"
                  }
                }[grade];

                return (
                  <tr key={`${grade}-${index}`} className={`hover:bg-slate-800/30 ${styles.row}`}>
                    <td className="px-3 py-3 font-bold text-slate-200">{oil.country}</td>
                    <td className="px-3 py-3 font-mono text-slate-400">{oil.capacity}</td>
                    <td className={`px-3 py-3 font-medium ${styles.quality}`}>{oil.quality}</td>
                    <td className="px-3 py-3 text-slate-500">{oil.description}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SourcesForProvenReservesData;
