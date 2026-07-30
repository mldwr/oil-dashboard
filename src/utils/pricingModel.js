/**
 * OIL PRICING MODEL - Historical Data Lookup
 *
 * METHODOLOGY:
 * ============
 * This model uses historical pricing data to determine the adjusted price
 * for each crude grade based on the Brent benchmark.
 *
 * 1. EXACT MATCH: If the requested Brent price exists in the history, use the recorded crude price.
 * 2. INTERPOLATION: If the Brent price is between known data points, linearly interpolate.
 * 3. EXTRAPOLATION: If the Brent price is outside the historical range, linearly extrapolate
 *    based on the nearest available data trend.
 */

import brentCsv from "../data/brent_extracted.csv?raw";
import canadaCsv from "../data/Canada_Western_Canadian_Select_extracted.csv?raw";
import iranCsv from "../data/Iran_Light_extracted.csv?raw";
import iraqCsv from "../data/Iraq_Basrah_Medium_extracted.csv?raw";
import kuwaitCsv from "../data/Kuwait_Export_Blend_extracted.csv?raw";
import libyaCsv from "../data/Libyia_Es_Sider_extracted.csv?raw";
import russiaCsv from "../data/russia_urals_extracted.csv?raw";
import saudiCsv from "../data/Saudi_Arabia_Arab_Light_extracted.csv?raw";
import uaeCsv from "../data/uae_murban_extracted.csv?raw";
import usaCsv from "../data/usa_wti_crude_extracted.csv?raw";
import venezuelaCsv from "../data/Venezuela_Merey_extracted.csv?raw";

// constraint_y values represent the actual market prices at $66.24 Brent (January 14th baseline).
export const BASELINE_BRENT = 66.24;

const CSV_BY_COUNTRY = {
  "Canada": canadaCsv,
  "Iran": iranCsv,
  "Iraq": iraqCsv,
  "Kuwait": kuwaitCsv,
  "Libya": libyaCsv,
  "Russia": russiaCsv,
  "Saudi Arabia": saudiCsv,
  "UAE": uaeCsv,
  "USA": usaCsv,
  "Venezuela": venezuelaCsv,
};

const parseCsvRows = (csvText) => {
  if (!csvText) return [];
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(",");
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

const BRENT_BY_DATE = buildDatePriceMap(parseCsvRows(brentCsv));
const LOOKUP_SERIES_BY_COUNTRY = Object.fromEntries(
  Object.entries(CSV_BY_COUNTRY).map(([country, csv]) => [
    country,
    buildLookupSeries(BRENT_BY_DATE, csv),
  ])
);

const findLookupPrice = (country, brentPrice, options = {}) => {
  const series = LOOKUP_SERIES_BY_COUNTRY[country];
  if (!series || series.length === 0 || !Number.isFinite(brentPrice)) return null;
  const target = roundPrice(brentPrice);
  const min = series[0].brent;
  const max = series[series.length - 1].brent;
  if (target < min || target > max) {
    if (options.outOfRange !== "extrapolate" || series.length < 2) return null;
    if (target < min) {
      const lower = series[0];
      const upper = series[1];
      const t = (target - lower.brent) / (upper.brent - lower.brent);
      return lower.crude + t * (upper.crude - lower.crude);
    }
    const lower = series[series.length - 2];
    const upper = series[series.length - 1];
    const t = (target - lower.brent) / (upper.brent - lower.brent);
    return lower.crude + t * (upper.crude - lower.crude);
  }

  let low = 0;
  let high = series.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midBrent = series[mid].brent;
    if (midBrent === target) return series[mid].crude;
    if (midBrent < target) low = mid + 1;
    else high = mid - 1;
  }
  const lower = series[high];
  const upper = series[low];
  if (!lower || !upper) return null;
  const t = (target - lower.brent) / (upper.brent - lower.brent);
  return lower.crude + t * (upper.crude - lower.crude);
};

/**
 * Calculate adjusted crude price using historical lookup
 * 
 * @param {Object} crudeData - Oil data object from OIL_DATA
 * @param {number} brentPrice - Current Brent benchmark price ($/bbl)
 * @returns {number} Adjusted price for the specific crude grade ($/bbl)
 */
export const getRegressionModelForCountry = () => {
  // Legacy support for components expecting this function
  // Regression models have been deprecated in favor of historical lookup
  return null;
};

export const calculateAdjustedPrice = (crudeData, brentPrice, options = {}) => {
  const outOfRange = options.outOfRange ?? "extrapolate";
  
  const lookup = findLookupPrice(crudeData.country, brentPrice, {
    outOfRange: outOfRange === "extrapolate" ? "extrapolate" : "none",
  });
  
  if (Number.isFinite(lookup)) return lookup;
  
  // Fallback if lookup completely fails (should not happen with extrapolation)
  return 0;
};

/**
 * Calculate all derived metrics for a crude oil entry
 * 
 * @param {Object} crudeData - Oil data object from OIL_DATA
 * @param {number} brentPrice - Current Brent benchmark price ($/bbl)
 * @returns {Object} Calculated metrics including adjusted price, profit, and values
 */
export const calculateCrudeMetrics = (crudeData, brentPrice) => {
  const adjPrice = Number.isFinite(crudeData.adjustedPrice)
    ? crudeData.adjustedPrice
    : calculateAdjustedPrice(crudeData, brentPrice);
  const liftingCost = crudeData.liftingCost;
  const netProfitPerBbl = adjPrice - liftingCost;
  
  return {
    currentAdjPrice: adjPrice,
    netProfitPerBbl,
    totalNetValue: (crudeData.capacity * netProfitPerBbl) / 1000,  // Convert to trillions
    grossValue: (crudeData.capacity * adjPrice) / 1000,  // Convert to trillions
  };
};
