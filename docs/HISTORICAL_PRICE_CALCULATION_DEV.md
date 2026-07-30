# Historical Price Calculation - Developer Guide

This document explains the technical implementation of the historical pricing model used in the Oil Dashboard. Unlike theoretical regression models, this system relies on actual historical data relationships between Brent Crude and various country-specific crude grades.

## 1. Data Flow Overview

The pricing engine transforms raw CSV data into a high-performance lookup system that drives the dashboard's interactive features.

### A. Data Ingestion (Import)
The system imports raw CSV files using Vite's `?raw` suffix. This loads the file content as a string at build time/runtime.

**Source Files:**
- `src/data/brent_extracted.csv`: The benchmark dataset (Brent Crude).
- `src/data/*_extracted.csv`: Country-specific crude datasets (e.g., `usa_wti_crude_extracted.csv`).

**Format:**
```csv
x_value,y_value,x_px,y_px,x_iso
...,...,...,...,2021-01-09
```
*Key columns used:*
- `x_iso`: Date (ISO format)
- `y_value`: Price in USD

### B. Parsing & Indexing
**File:** `src/utils/pricingModel.js`

1.  **`parseCsvRows(csvText)`**:
    - Splits the CSV string by newlines.
    - Extracts `date` and `price`.
    - Ignores invalid rows.

2.  **`buildDatePriceMap(rows)`**:
    - Aggregates prices by date.
    - Handles cases where multiple entries exist for a single date (calculates the daily average).
    - **Output:** `Map<DateString, Price>`

### C. Correlation (Brent vs. Country)
The system builds a relationship model by matching dates where *both* Brent and the specific Country's crude have price data.

**Function:** `buildLookupSeries(brentByDate, crudeCsv)`
1.  Iterates through every date in the Country's dataset.
2.  Looks up the corresponding Brent price for that date.
3.  **Bucketing:** Groups the Country's crude prices by the **Rounded Brent Price** (2 decimal places).
    - *Example:* If Brent was $60.00 on Jan 1st and Jan 15th, the crude prices for those days are averaged into the $60.00 bucket.
4.  **Sorting:** The resulting series is sorted by Brent price (ascending).

**Resulting Lookup Structure:**
```javascript
[
  { brent: 57.61, crude: 54.20 },
  { brent: 57.62, crude: 54.22 },
  ...
  { brent: 130.51, crude: 125.10 }
]
```

## 2. Calculation Logic

When the user moves the slider or the system queries a price, `calculateAdjustedPrice` is called.

**Input:**
- `country`: The target country name.
- `brentPrice`: The requested benchmark price (e.g., from the slider).

**Algorithm (`findLookupPrice`):**

1.  **Exact Match:**
    - The system performs a search (binary search optimization) for the `brentPrice` in the lookup series.
    - If found, it returns the stored average crude price.
    - *Note:* Since the series is bucketed by rounded Brent price, "Exact Match" effectively means "Average of all historical days where Brent was approx. this price".

2.  **Interpolation (Standard Case):**
    - If the requested price falls between two known data points (e.g., $60.00 and $60.01), linear interpolation is used.
    - Formula: $y = y_1 + \frac{(x - x_1)(y_2 - y_1)}{(x_2 - x_1)}$

## 3. Component Integration

### Slider Interaction
1.  **User Action:** User drags the slider in `OilDashboard` (or similar parent component).
2.  **State Update:** `marketPrice` state is updated (e.g., to $75.00).
3.  **Re-Calculation:**
    - `useMemo` hook triggers.
    - Iterates over `OIL_DATA`.
    - Calls `calculateCrudeMetrics(countryData, 75.00)`.

### Metrics Calculation
`calculateCrudeMetrics` returns a unified object:
- `currentAdjPrice`: The calculated crude price (from lookup).
- `netProfitPerBbl`: `currentAdjPrice - liftingCost`.
- `totalNetValue`: `capacity * netProfitPerBbl` (Trillions).

## 4. Examples

### Scenario A: Historical Data Exists
*   **Input:** User sets Brent to **$60.00**.
*   **Data:**
    - History shows on 5 different days Brent was ~$60.00.
    - The average WTI price on those days was $58.50.
*   **Result:** The model returns **$58.50** for USA.

### Scenario B: Interpolation
*   **Input:** User sets Brent to **$60.005** (High precision).
*   **Data:**
    - Entry at $60.00 -> Crude $58.00
    - Entry at $60.01 -> Crude $58.10
*   **Result:** Linear interpolation returns **$58.05**.

