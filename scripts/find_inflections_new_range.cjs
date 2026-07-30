const fs = require('fs');
const path = require('path');

// 1. Read CSVs
const dataDir = path.join(__dirname, '../src/data');
function readCsv(filename) {
  try {
    return fs.readFileSync(path.join(dataDir, filename), 'utf8');
  } catch (e) {
    console.error(`Error reading ${filename}:`, e.message);
    return '';
  }
}

const brentCsv = readCsv('brent_extracted.csv');
const canadaCsv = readCsv('Canada_Western_Canadian_Select_extracted.csv');
const iranCsv = readCsv('Iran_Light_extracted.csv');
const iraqCsv = readCsv('Iraq_Basrah_Medium_extracted.csv');
const kuwaitCsv = readCsv('Kuwait_Export_Blend_extracted.csv');
const libyaCsv = readCsv('Libyia_Es_Sider_extracted.csv');
const russiaCsv = readCsv('russia_urals_extracted.csv');
const saudiCsv = readCsv('Saudi_Arabia_Arab_Light_extracted.csv');
const uaeCsv = readCsv('uae_murban_extracted.csv');
const usaCsv = readCsv('usa_wti_crude_extracted.csv');
const venezuelaCsv = readCsv('Venezuela_Merey_extracted.csv');

// 2. Load pricingModel.js logic
let pricingModelCode = fs.readFileSync(path.join(__dirname, '../src/utils/pricingModel.js'), 'utf8');

// Remove imports (lines starting with import)
pricingModelCode = pricingModelCode.replace(/import .*? from .*?;/g, '');
// Remove exports and assign to var (to be accessible after eval)
pricingModelCode = pricingModelCode.replace(/export const/g, 'var');
// Remove ?raw usage if any remains (though regex above should catch it)

// 3. Load oilData.js logic
let oilDataCode = fs.readFileSync(path.join(__dirname, '../src/data/oilData.js'), 'utf8');
oilDataCode = oilDataCode.replace(/export const/g, 'var');

// 4. Eval
// We need to eval pricingModel first, but it uses CSV variables we just defined.
// So we wrap in a function or just eval in global scope.
// However, pricingModel defines `const CSV_BY_COUNTRY = ...` using the variables `canadaCsv` etc.
// So those variables must be in scope.

// Using eval in global scope
eval(pricingModelCode);
eval(oilDataCode);

// 5. Run Analysis
// Range: 57.61 to 130.51

function getRank(price) {
  const stats = OIL_DATA.map(country => {
    const metrics = calculateCrudeMetrics(country, price);
    return { country: country.country, totalNetValue: metrics.totalNetValue };
  });
  stats.sort((a, b) => b.totalNetValue - a.totalNetValue);
  const vIndex = stats.findIndex(s => s.country === 'Venezuela');
  return {
    rank: vIndex + 1,
    ahead: vIndex > 0 ? stats[vIndex - 1].country : null,
    behind: vIndex < stats.length - 1 ? stats[vIndex + 1].country : null,
    value: stats[vIndex].totalNetValue
  };
}

console.log("Analyzing Venezuela rank changes from $57.61 to $130.51...");

let prevRank = -1;
let prevAhead = '';

// Step by $0.10
for (let p = 5761; p <= 13051; p += 10) {
  const price = p / 100;
  const { rank, ahead, behind } = getRank(price);

  if (prevRank !== -1 && rank !== prevRank) {
    console.log(`Rank change at $${price.toFixed(2)}: #${prevRank} -> #${rank} (Ahead: ${ahead}, Behind: ${behind})`);
  }
  
  // Also check if we overtake someone even if rank doesn't change (e.g. if multiple people swap around us, unlikely but possible)
  // More interestingly, check if 'ahead' changes (meaning we passed someone, or someone passed us)
  if (prevRank !== -1 && rank === prevRank && ahead !== prevAhead) {
     // This happens if the person ahead of us changes.
     // Could be we passed them (and someone else passed us?) or they passed someone else.
     // If we are #5 and ahead was A, now ahead is B.
     // Maybe A fell behind B?
     // If we are strictly analyzing OUR position, Rank is the most important.
  }

  prevRank = rank;
  prevAhead = ahead;
}

// Check specific points of interest near the start/end
[58, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120, 130].forEach(price => {
  const { rank, ahead, behind } = getRank(price);
  // console.log(`At $${price}: Rank #${rank} (Behind ${ahead})`);
});

// Check the old points 59 and 85
console.log("\nChecking previous inflection points:");
[59, 85].forEach(price => {
  const { rank, ahead, behind } = getRank(price);
  console.log(`At $${price}: Rank #${rank}, Behind ${ahead}, Ahead of ${behind}`);
});
