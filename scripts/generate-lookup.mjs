/**
 * Precompute historical price lookup tables from the raw `*_extracted.csv`
 * datasets into a single compact `src/data/generated/lookup.json`.
 *
 * WHY: The CSVs (~1.4 MB total) were previously imported with `?raw` and inlined
 * into the client bundle at module load. The runtime only ever needs the small
 * `{ brent, crude }` interpolation series per country, so we bake that result
 * once at build time and ship only the lookup data.
 *
 * The algorithm here mirrors `src/utils/pricingModel.js` (parseCsvRows,
 * buildDatePriceMap, buildLookupSeries, roundPrice). Keep them in sync.
 *
 * Run with:  node scripts/generate-lookup.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../src/data');
const OUT_DIR = path.join(DATA_DIR, 'generated');
const OUT_FILE = path.join(OUT_DIR, 'lookup.json');

// Mirrors CSV_BY_COUNTRY in src/utils/pricingModel.js
const CSV_BY_COUNTRY = {
  Canada: 'Canada_Western_Canadian_Select_extracted.csv',
  Iran: 'Iran_Light_extracted.csv',
  Iraq: 'Iraq_Basrah_Medium_extracted.csv',
  Kuwait: 'Kuwait_Export_Blend_extracted.csv',
  Libya: 'Libyia_Es_Sider_extracted.csv',
  Russia: 'russia_urals_extracted.csv',
  'Saudi Arabia': 'Saudi_Arabia_Arab_Light_extracted.csv',
  UAE: 'uae_murban_extracted.csv',
  USA: 'usa_wti_crude_extracted.csv',
  Venezuela: 'Venezuela_Merey_extracted.csv',
};

const BASELINE_BRENT = 66.24;

const parseCsvRows = (csvText) => {
  if (!csvText) return [];
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(',');
    const yValue = parts[1];
    const xIso = parts[4];
    const price = Number(yValue);
    if (!xIso || !Number.isFinite(price)) continue;
    rows.push({ date: xIso, price });
  }
  return rows;
};

const buildDatePriceMap = (rows) => {
  const map = new Map();
  for (const row of rows) {
    const entry = map.get(row.date);
    if (entry) {
      entry.sum += row.price;
      entry.count += 1;
    } else {
      map.set(row.date, { sum: row.price, count: 1 });
    }
  }
  const averaged = new Map();
  for (const [date, entry] of map) {
    averaged.set(date, entry.sum / entry.count);
  }
  return averaged;
};

const roundPrice = (value) => Math.round(value * 100) / 100;

const buildLookupSeries = (brentByDate, crudeCsv) => {
  const crudeByDate = buildDatePriceMap(parseCsvRows(crudeCsv));
  const merged = new Map();
  for (const [date, crudePrice] of crudeByDate) {
    const brentPrice = brentByDate.get(date);
    if (!Number.isFinite(brentPrice) || !Number.isFinite(crudePrice)) continue;
    const brentKey = roundPrice(brentPrice);
    const entry = merged.get(brentKey);
    if (entry) {
      entry.sum += crudePrice;
      entry.count += 1;
    } else {
      merged.set(brentKey, { sum: crudePrice, count: 1 });
    }
  }
  return Array.from(merged, ([brent, entry]) => ({
    brent,
    crude: entry.sum / entry.count,
  })).sort((a, b) => a.brent - b.brent);
};

const readCsv = (filename) => fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');

const brentByDate = buildDatePriceMap(parseCsvRows(readCsv('brent_extracted.csv')));

const lookupByCountry = Object.fromEntries(
  Object.entries(CSV_BY_COUNTRY).map(([country, filename]) => [
    country,
    buildLookupSeries(brentByDate, readCsv(filename)),
  ])
);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(lookupByCountry), 'utf8');

const totalPoints = Object.values(lookupByCountry).reduce((n, s) => n + s.length, 0);
const bytes = fs.statSync(OUT_FILE).size;
console.log(`Wrote ${OUT_FILE}`);
console.log(`  ${totalPoints} interpolation points across ${Object.keys(lookupByCountry).length} countries`);
console.log(`  ${(bytes / 1024).toFixed(1)} KB (was ~${(1400000 / 1024).toFixed(0)} KB of inlined CSV)`);