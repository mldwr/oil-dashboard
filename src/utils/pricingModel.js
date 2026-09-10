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
 *
 * NOTE: The raw `*_extracted.csv` datasets (~1.4 MB) are NOT bundled here. The
 * interpolation tables are precomputed at build time by
 * `scripts/generate-lookup.mjs` into `src/data/generated/lookup.json`.
 */

// Precomputed `{ brent, crude }` lookup series per country (see scripts/generate-lookup.mjs).
import lookupByCountry from "../data/generated/lookup.json";

// constraint_y values represent the actual market prices at $66.24 Brent (January 14th baseline).
export const BASELINE_BRENT = 66.24;

const LOOKUP_SERIES_BY_COUNTRY = lookupByCountry;

const roundPrice = (value) => Math.round(value * 100) / 100;

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
