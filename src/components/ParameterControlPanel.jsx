import React, { useMemo } from 'react';
import FlagSphere from './FlagSphere';
import GradeBadge from './GradeBadge';
import { calculateAdjustedPrice } from '../utils/pricingModel';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const ParameterControlPanel = ({ oilData, overrides, brentPrice, onChangeCountryParameter, onResetAll }) => {
  const oilDataByCountry = useMemo(() => {
    return oilData.reduce((acc, d) => {
      acc[d.country] = d;
      return acc;
    }, {});
  }, [oilData]);

  const hasOverrides = Object.keys(overrides || {}).length > 0;

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col max-h-229">
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0 gap-3">
        <h2 className="font-bold flex items-center gap-2 tracking-tight">Parameter Control Panel</h2>
        <button
          type="button"
          onClick={onResetAll}
          disabled={!hasOverrides}
          className={`text-[10px] uppercase font-bold tracking-wider px-3 py-2 rounded-lg border transition-colors ${
            hasOverrides
              ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          Reset to Default Values
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-2 scrollbar-hide">
        {oilData.map((d) => {
          const base = oilDataByCountry[d.country] || d;
          const entryOverrides = overrides?.[d.country] || {};
          const baseAdjustedPrice = calculateAdjustedPrice(base, brentPrice);
          const adjustedPrice = entryOverrides.adjustedPrice ?? baseAdjustedPrice;
          const liftingCost = entryOverrides.liftingCost ?? d.liftingCost;
          const isAdjustedPriceOverridden = entryOverrides.adjustedPrice !== undefined && Math.abs(entryOverrides.adjustedPrice - baseAdjustedPrice) >= 0.01;
          const isLiftingCostOverridden = entryOverrides.liftingCost !== undefined && entryOverrides.liftingCost !== base.liftingCost;
          const adjustedPriceInput = Number.isFinite(adjustedPrice) ? Math.round(adjustedPrice) : '';

          return (
            <div
              key={d.country}
              className="p-3 hover:bg-slate-800/50 rounded-lg transition-colors border-b border-slate-800/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0">
                  <svg viewBox="0 0 40 40" width="40" height="40">
                    <FlagSphere countryCode={d.code} cx={20} cy={20} r={24} isHovered={false} variant="rect" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold truncate">{d.country}</div>
                    <GradeBadge grade={d.grade} />
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-tighter truncate">{d.quality}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`bg-slate-950/30 border rounded-xl p-3 ${isAdjustedPriceOverridden ? 'border-emerald-700/60' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Adjusted Price</div>
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    max="200"
                    value={adjustedPriceInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') return;
                      const next = clamp(Number(raw), 0, 200);
                      if (!Number.isFinite(next)) return;
                      onChangeCountryParameter(d.country, { adjustedPrice: Math.round(next) });
                    }}
                    className="mt-2 w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$0</span>
                    <span>$200</span>
                  </div>
                </div>

                <div className={`bg-slate-950/30 border rounded-xl p-3 ${isLiftingCostOverridden ? 'border-emerald-700/60' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Lifting Cost</div>
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    max="100"
                    value={Number.isFinite(liftingCost) ? Math.round(liftingCost) : ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') return;
                      const next = clamp(Number(raw), 0, 100);
                      if (!Number.isFinite(next)) return;
                      onChangeCountryParameter(d.country, { liftingCost: Math.round(next) });
                    }}
                    className="mt-2 w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$0</span>
                    <span>$100</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParameterControlPanel;
