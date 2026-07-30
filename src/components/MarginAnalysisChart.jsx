import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DollarSign } from 'lucide-react';

const MarginAnalysisChart = ({ calculatedData, CustomTooltip }) => {
  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <DollarSign className="text-emerald-400" /> Margin Analysis
        </h2>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={calculatedData}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                horizontal={true}
                vertical={false}
              />
              <XAxis type="number" stroke="#64748b" hide />
              <YAxis
                dataKey="country"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                width={80}
              />
              <Tooltip content={CustomTooltip} cursor={{ fill: '#1e293b' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="liftingCost"
                name="Lifting Cost ($/bbl)"
                stackId="a"
                fill="#d05c5cff"
                radius={[0, 0, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="netProfitPerBbl"
                name="Net Profit Margin ($/bbl)"
                stackId="a"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarginAnalysisChart;
