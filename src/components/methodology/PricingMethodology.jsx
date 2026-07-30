import React from 'react';
import { TrendingUp, Info, FileText } from 'lucide-react';

const PricingMethodology = () => {
  return (
    <div className="mt-12 pt-12 border-t border-slate-800/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <TrendingUp className="text-purple-400" size={24} />
        </div>
        <h3 className="text-xl font-bold bg-linear-to-r from-purple-100 to-slate-400 bg-clip-text text-transparent">
          Pricing Methodology
        </h3>
      </div>

      <div className="bg-amber-950/30 border border-amber-600/50 rounded-xl p-6 mb-6">
        <h4 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Info size={16} />
          HISTORICAL DATA MODEL & CALCULATION LOGIC
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
              This dashboard uses <strong>historical pricing data lookup</strong> to map Brent benchmarks
              to each country’s crude price. Instead of a theoretical regression formula, we use actual
              historical relationships between Brent and specific crude grades.
            </p>
            
            <div className="bg-slate-900/50 p-3 rounded border border-slate-800 mb-3">
              <code className="text-emerald-300 font-mono text-[10px]">
                adjPrice = HistoricalLookup(BrentPrice)
              </code>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="pl-3 border-l-2 border-emerald-500/30">
                <strong className="text-emerald-400">Data Source:</strong> <a href="https://oilprice.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OilPrice.com</a> (~2,000+ daily historical data points per country)
              </div>
              <div className="pl-3 border-l-2 border-blue-500/30">
                <strong className="text-blue-400">Range:</strong> Covers historical Brent prices from ~$57 to ~$130
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-4">
            <h5 className="text-[11px] font-bold text-slate-200 mb-3 flex items-center gap-2">
              <FileText size={12} />
              Calculation Methodology
            </h5>
            <div className="space-y-3 text-[10px] text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-200 block mb-1">1. Exact Match:</strong>
                If the selected Brent price exists in our historical dataset, we calculate the average of all historical crude prices recorded when Brent was at that specific level.
              </p>
              <p>
                <strong className="text-slate-200 block mb-1">2. Interpolation:</strong>
                If the selected Brent price falls between two historical data points, we use linear interpolation to determine the crude price.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Added: Data Coverage Overview Table */}
      <div className="mt-8">
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Data Coverage Overview</h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Data Points</th>
                <th className="px-3 py-2">Min Brent ($)</th>
                <th className="px-3 py-2">Max Brent ($)</th>
                <th className="px-3 py-2">Coverage Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { country: "Global (Brent)", points: "2,659", min: "$19.33", max: "$133.18", quality: "Benchmark", qualityColor: "text-blue-400" },
                { country: "USA", points: "2,094", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "Saudi Arabia", points: "2,646", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "Russia", points: "2,646", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "Canada", points: "2,646", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "Iraq", points: "2,646", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "UAE", points: "2,646", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "Kuwait", points: "2,646", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "Iran", points: "2,646", min: "$57.61", max: "$130.51", quality: "High", qualityColor: "text-emerald-400" },
                { country: "Venezuela", points: "30", min: "$60.55", max: "$121.28", quality: "Low (Extrapolated)", qualityColor: "text-amber-400" },
                { country: "Libya", points: "31", min: "$60.55", max: "$121.28", quality: "Low (Extrapolated)", qualityColor: "text-amber-400" },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-slate-800/30">
                  <td className="px-3 py-2 font-bold text-slate-200">{row.country}</td>
                  <td className="px-3 py-2 font-mono text-slate-400">{row.points}</td>
                  <td className="px-3 py-2 font-mono text-slate-400">{row.min}</td>
                  <td className="px-3 py-2 font-mono text-slate-400">{row.max}</td>
                  <td className={`px-3 py-2 font-medium ${row.qualityColor}`}>{row.quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PricingMethodology;
