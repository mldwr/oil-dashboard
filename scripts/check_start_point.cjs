// ... (setup code as before) ...
const fs = require('fs');
const path = require('path');

// 1. Read CSVs
const dataDir = path.join(__dirname, '../src/data');
function readCsv(filename) {
  try {
    return fs.readFileSync(path.join(dataDir, filename), 'utf8');
  } catch (e) {
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

let pricingModelCode = fs.readFileSync(path.join(__dirname, '../src/utils/pricingModel.js'), 'utf8');
pricingModelCode = pricingModelCode.replace(/import .*? from .*?;/g, '');
pricingModelCode = pricingModelCode.replace(/export const/g, 'var');

let oilDataCode = fs.readFileSync(path.join(__dirname, '../src/data/oilData.js'), 'utf8');
oilDataCode = oilDataCode.replace(/export const/g, 'var');

eval(pricingModelCode);
eval(oilDataCode);

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

const p = 57.61;
const info = getRank(p);
console.log(`At start of range ($${p}):`);
console.log(`Rank: #${info.rank}`);
console.log(`Ahead: ${info.ahead}`);
console.log(`Behind: ${info.behind}`);
console.log(`Value: ${info.value.toFixed(2)}T`);
