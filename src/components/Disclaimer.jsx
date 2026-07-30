import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="max-w-7xl mx-auto mt-12 mb-16 p-8 bg-slate-900/40 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-red-500/10 transition-colors duration-700"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <h3 className="text-xl font-bold bg-linear-to-r from-red-100 to-slate-400 bg-clip-text text-transparent">
            Disclaimer
          </h3>
        </div>

        <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-6">
          <p className="text-xs text-slate-400 leading-relaxed text-justify">
            This dashboard is for public, educational use only. It explores how much oil might be usable and the role of operating costs, not whether a
            reserve is a good investment. The figures shown are simplified, illustrative estimates based on public sources and historical price patterns.
            They do not include time-based cash-flow modeling, discounting, development schedules, recovery factors, taxes, royalties, or other fiscal
            terms that are required for professional reserve valuation. Do not use this dashboard to make investment decisions. Please do your own
            research and consult qualified professionals before making financial commitments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
