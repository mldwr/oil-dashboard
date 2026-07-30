import React from 'react';

const MarketPriceSlider = ({ marketPrice, setMarketPrice, resetAllCountryOverrides }) => {
  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-6 w-full md:w-auto">
      <div className="flex-1 md:w-64">
        <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wider">Brent Market Price (Benchmark)</label>
        <input
          type="range"
          min="58"
          max="130"
          step="1"
          value={marketPrice}
          onChange={(e) => {
            setMarketPrice(Number(e.target.value));
            resetAllCountryOverrides();
          }}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono"><span>$58</span><span>$130</span></div>
      </div>
      <div className="text-center bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 min-w-25">
        <span className="text-2xl font-mono font-bold text-emerald-400">${marketPrice.toFixed(0)}</span>
        <span className="text-[10px] block text-slate-500 font-bold uppercase">/ bbl</span>
      </div>
    </div>
  );
};

export default MarketPriceSlider;
