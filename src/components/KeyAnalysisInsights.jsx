import React from 'react';
import { Info, Droplets, Key } from 'lucide-react';

const KeyAnalysisInsights = ({ calculatedData = [] }) => {
  // Helper to format numbers
  const fmtCurrency = (val) => {
    if (val === undefined || val === null) return '$0.00';
    return val < 0 ? `-$${Math.abs(val).toFixed(2)}` : `$${val.toFixed(2)}`;
  };
  const fmtTrillion = (val) => val ? `$${val.toFixed(1)}T` : '$0.0T';

  // Helper for narrative text to handle negative margins
  const describeMargin = (val) => {
    if (val < 0) return `negative operating margin of ${fmtCurrency(val)}`;
    return `operating margin of ${fmtCurrency(val)}`;
  };

  // Find specific country data
  const saudi = calculatedData.find(c => c.country === 'Saudi Arabia') || {};
  const venezuela = calculatedData.find(c => c.country === 'Venezuela') || {};
  const canada = calculatedData.find(c => c.country === 'Canada') || {};
  const usa = calculatedData.find(c => c.country === 'USA') || {};

  // Calculate operating costs and margins (OPEX-only)
  const saudiOperatingCost = saudi.liftingCost ?? 0;
  const saudiOperatingMargin = (saudi.currentAdjPrice ?? 0) - saudiOperatingCost;

  const venezuelaOperatingCost = venezuela.liftingCost ?? 0;
  const canadaOperatingCost = canada.liftingCost ?? 0;
  const canadaOperatingMargin = (canada.currentAdjPrice ?? 0) - canadaOperatingCost;

  const usaOperatingCost = usa.liftingCost ?? 0;
  const usaOperatingMargin = (usa.currentAdjPrice ?? 0) - usaOperatingCost;

  // Global aggregate for impact statement
  const totalReserves = calculatedData.reduce((acc, curr) => acc + curr.capacity, 0);
  const impactPerDollar = (totalReserves * 1) / 1000; // Trillions per $1 change

  return (
    <div className="max-w-7xl mx-auto mt-12 mb-16 p-8 bg-slate-900/40 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-green-500/10 transition-colors duration-700"></div>

      <div className="relative z-10">
            <div className="">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Key className="text-green-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-green-100 to-slate-400 bg-clip-text text-transparent">
                  Key Analysis Insights
                </h2>
              </div>

              <div className="mb-6 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                <p className="text-xs text-slate-400 leading-relaxed">
                  These insights are educational summaries based on simplified 2015 OPEX inputs and historical price lookups. Rankings and narratives are illustrative, not forecasts, and should not be interpreted as investment analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
                <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-2 underline decoration-blue-500/30 underline-offset-4 font-mono">
                  <Info size={18} /> WHY THE DROP?
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Observe the <strong className="text-stone-400">Heavy Grade (Brown)</strong> lines. Venezuela and Canada have large reserves but can rank lower in this simplified view because bitumen-heavy oil typically needs more heat and refining, which can reduce realized prices and increase extraction costs.
                </p>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                <h3 className="text-emerald-400 font-bold flex items-center gap-2 mb-2 underline decoration-emerald-500/30 underline-offset-4 font-mono">
                  <Droplets size={18} /> THE PREMIUM EFFECT
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  <strong className="text-emerald-400">Light Sweet (Emerald)</strong> lines like UAE and USA can trend upward. Their oil is "Sweet" (low sulfur), which often earns a premium, resulting in higher realized prices than heavier peers in this model.
                </p>
              </div>
              
                <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">Illustrative Cost Advantage: Saudi Arabia</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Saudi Arabia combines large reserves ({saudi.capacity}B bbl) with a lifting cost of {fmtCurrency(saudiOperatingCost)}/bbl (OPEX-only). In this simplified view, that implies an estimated operating margin of {fmtCurrency(saudiOperatingMargin)}/bbl at current prices, highlighting how low costs can offset price swings.
                  </p>
                  <div className="bg-slate-900/50 p-3 rounded-lg border-l-2 border-emerald-500">
                    <div className="text-xs font-bold text-emerald-300 mb-1">Total Net Value (Operating Basis)</div>
                    <div className="text-base font-mono font-bold text-emerald-400">{fmtTrillion(saudi.totalNetValue)}</div>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">The Venezuela/Canada Paradox</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Venezuela has the <strong>largest proven reserves globally ({venezuela.capacity}B bbl)</strong>, yet its net value can appear constrained here because extra-heavy crude extraction is modeled at {fmtCurrency(venezuelaOperatingCost)}/bbl (OPEX-only). Canada, with {canada.capacity}B bbl of bitumen, faces higher modeled lifting costs at {fmtCurrency(canadaOperatingCost)}/bbl, resulting in a {describeMargin(canadaOperatingMargin)}/bbl. This comparison illustrates how extraction complexity can offset large volumes.
                  </p>
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1 bg-slate-900/50 p-2 rounded-lg border-l-2 border-orange-500">
                      <div className="text-[10px] font-bold text-orange-300">Venezuela</div>
                      <div className="text-xs font-mono font-bold text-orange-400">{fmtTrillion(venezuela.totalNetValue)} Net Value (Op.)</div>
                    </div>
                    <div className="flex-1 bg-slate-900/50 p-2 rounded-lg border-l-2 border-red-500">
                      <div className="text-[10px] font-bold text-red-300">Canada</div>
                      <div className="text-xs font-mono font-bold text-red-400">{fmtTrillion(canada.totalNetValue)} Net Value (Op.)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">Shale Cost Profile (USA)</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    The U.S. shale oil industry extracts tight oil from reservoirs with high operational intensity, resulting in modeled lifting costs of {fmtCurrency(usaOperatingCost)}/bbl (OPEX-only). At the current WTI price of ~{fmtCurrency(usa.currentAdjPrice)}/bbl, this yields a {describeMargin(usaOperatingMargin)}/bbl in this simplified estimate, illustrating how margins can be tighter than lower-cost regions.
                  </p>
                  <div className="bg-slate-900/50 p-3 rounded-lg border-l-2 border-cyan-500">
                    <div className="text-xs font-bold text-cyan-300 mb-1">Operating Margin Per Barrel (OPEX-only)</div>
                    <div className="text-base font-mono font-bold text-cyan-400">{fmtCurrency(usaOperatingMargin)}/bbl @ {fmtCurrency(usa.currentAdjPrice)} WTI</div>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-teal-400 mb-3 uppercase tracking-wider">Understanding the Variables</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <div className="text-teal-400 font-bold">Market Price:</div>
                      <div className="text-slate-400">Brent or WTI benchmark adjusted for quality premiums/discounts based on API gravity and sulfur content.</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="text-teal-400 font-bold">Lifting Cost:</div>
                      <div className="text-slate-400">The per-barrel operating expense (OPEX-only) to extract and lift oil; this view excludes CAPEX and does not adjust for inflation or basin-specific shifts.</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="text-teal-400 font-bold">Market Surplus:</div>
                      <div className="text-slate-400">Supply and demand balance can compress or expand margins; this view does not model policy, inventories, or producer strategy.</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="text-teal-400 font-bold">Net Value Impact:</div>
                      <div className="text-slate-400">Small price changes can move rankings. A $2/bbl move implies ~${(impactPerDollar * 2).toFixed(1)}T shift in global net value in this calculation.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
};

export default KeyAnalysisInsights;
