import React from 'react';
import { Calculator } from 'lucide-react';
import MarketValueTransparencyTable from './computationdetails/MarketValueTransparencyTable';
import NetProfitValueTransparencyTable from './computationdetails/NetProfitValueTransparencyTable';

const ComputationDetails = ({ marketPrice, data }) => {
  return (
    <div className="max-w-7xl mx-auto mt-12 mb-16 p-8 bg-slate-900/40 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-purple-500/10 transition-colors duration-700"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Calculator className="text-purple-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold bg-linear-to-r from-purple-100 to-slate-400 bg-clip-text text-transparent">
            Computation Details
          </h2>
        </div>

        {/* Market Value Transparency Table */}
        <MarketValueTransparencyTable marketPrice={marketPrice} data={data} />

        {/* Added: Net Profit Value Transparency Table */}
        <NetProfitValueTransparencyTable marketPrice={marketPrice} data={data} />
      </div>
    </div>
  );
};

export default ComputationDetails;
