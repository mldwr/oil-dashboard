import React, { useMemo } from 'react';
import historicOilDataCsv from '../data/historic_oildata.csv?raw';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_INDEX = MONTHS.reduce((acc, month, index) => {
  acc[month] = index;
  return acc;
}, {});

const parseHistoricOilData = (rawCsv) => {
  const lines = rawCsv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const parts = line.split(',');
    const entry = {};
    headers.forEach((header, index) => {
      if (header === 'Month') {
        entry[header] = parts[index];
      } else {
        const value = Number(parts[index]);
        entry[header] = Number.isFinite(value) ? value : null;
      }
    });
    return entry;
  });
};

const HistoricalPriceSlider = ({ selectedKey, onSelectionChange }) => {
  const entries = useMemo(() => {
    const parsed = parseHistoricOilData(historicOilDataCsv);
    return parsed.map((row) => {
      const [monthPart, yearPart] = (row.Month || '').split('-');
      const monthIndex = MONTH_INDEX[monthPart];
      const year = 2000 + Number(yearPart);
      return {
        key: row.Month,
        label: row.Month,
        monthIndex,
        monthName: monthPart,
        year,
        brent: row.Brent,
        values: row,
      };
    }).filter((entry) => Number.isFinite(entry.brent) && Number.isFinite(entry.monthIndex) && Number.isFinite(entry.year));
  }, []);

  const years = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => entry.year))).sort((a, b) => a - b);
  }, [entries]);

  const monthsByYear = useMemo(() => {
    const map = entries.reduce((acc, entry) => {
      const list = acc[entry.year] || [];
      if (!list.includes(entry.monthIndex)) list.push(entry.monthIndex);
      acc[entry.year] = list;
      return acc;
    }, {});
    Object.values(map).forEach((list) => list.sort((a, b) => a - b));
    return map;
  }, [entries]);

  if (entries.length === 0) return null;

  const selectedEntry = entries.find((entry) => entry.key === selectedKey) || entries[entries.length - 1];
  const selectedIndex = Math.max(0, entries.findIndex((entry) => entry.key === selectedEntry.key));
  const availableMonths = monthsByYear[selectedEntry.year] || [];

  const handleIndexChange = (event) => {
    const nextEntry = entries[Number(event.target.value)];
    if (nextEntry) onSelectionChange(nextEntry);
  };

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value);
    const months = monthsByYear[nextYear] || [];
    const monthIndex = months.includes(selectedEntry.monthIndex) ? selectedEntry.monthIndex : months[0];
    const nextEntry = entries.find((entry) => entry.year === nextYear && entry.monthIndex === monthIndex);
    if (nextEntry) onSelectionChange(nextEntry);
  };

  const handleMonthChange = (event) => {
    const nextMonthIndex = Number(event.target.value);
    const nextEntry = entries.find((entry) => entry.year === selectedEntry.year && entry.monthIndex === nextMonthIndex);
    if (nextEntry) onSelectionChange(nextEntry);
  };

  const brentDisplay = Number.isFinite(selectedEntry.brent) ? selectedEntry.brent.toFixed(0) : '--';

  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-4 w-full md:w-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold text-slate-500 mb-1 tracking-wider">Historical Price Snapshot</div>
          <div className="text-[10px] text-slate-400">Select a month to apply historical averages across the dashboard.</div>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-800/70 px-2 py-1 rounded border border-slate-700">
          {selectedEntry.label}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3">
          <select
            value={selectedEntry.year}
            onChange={handleYearChange}
            className="bg-slate-950/60 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-2 font-mono"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedEntry.monthIndex}
            onChange={handleMonthChange}
            className="bg-slate-950/60 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-2 font-mono"
          >
            {availableMonths.map((monthIndex) => (
              <option key={monthIndex} value={monthIndex}>{MONTHS[monthIndex]}</option>
            ))}
          </select>
        </div>
        <div className="text-center bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-2xl font-mono font-bold text-amber-400">${brentDisplay}</span>
          <span className="text-[10px] block text-slate-500 font-bold uppercase">/ bbl Brent</span>
        </div>
      </div>
      <div>
        <input
          type="range"
          min="0"
          max={Math.max(0, entries.length - 1)}
          step="1"
          value={selectedIndex}
          onChange={handleIndexChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>{entries[0].label}</span>
          <span>{entries[entries.length - 1].label}</span>
        </div>
      </div>
    </div>
  );
};

export default HistoricalPriceSlider;
