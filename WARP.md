# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install dependencies with your preferred Node package manager (for example, `npm install`).
- Start the development server: `npm run dev`
  - Runs the Vite dev server with React Fast Refresh.
- Build for production: `npm run build`
  - Produces an optimized static build using Vite.
- Preview the production build locally: `npm run preview`
  - Serves the contents of the last build output.
- Lint the project: `npm run lint`
  - Uses ESLint 9 with the base React/Vite configuration.

### Tests

- There is currently no `test` script defined in `package.json` and no obvious test runner configuration.
- Before assuming tests exist or adding new ones, search for any test-related files or tooling if the repo evolves.

## Project architecture

### Tooling and framework

- The app is a single-page React dashboard built on Vite (`vite.config.js`).
- React 19 with `react-dom` is used; the app is mounted via `createRoot` with `StrictMode`.
- Styling is almost entirely via Tailwind CSS v4, wired through the `@tailwindcss/vite` plugin.
- There is no routing library; the experience is a single-screen dashboard.

### Entrypoint and shell components

- `src/main.jsx`
  - Imports `./index.css` (Tailwind utilities) and the root `App` component.
  - Calls `createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)`.
- `src/App.jsx`
  - Very thin shell that wraps the main dashboard in a full-width, full-height container and renders `<OilDashboard />`.
  - This file is the bridge between the generic Vite entry and the domain-specific dashboard implemented in `src/oil-dashboard.jsx`.

### Oil dashboard module

- `src/oil-dashboard.jsx` is the core of the application and contains almost all domain logic and UI.
- Key pieces inside this module:
  - **Static domain data**
    - `OIL_DATA`: Array of country records with fields like `capacity`, `quality`, `grade` (`light` / `medium` / `heavy`), `marketPrice`, `extractionCost`, and a `color` used consistently across charts and badges.
  - **Presentation/helper components**
    - `FlagSphere`: Renders country flags as SVG badges (rectangular or spherical variants) for use inside charts and leaderboards.
    - `GradeBadge`: Small pill indicating oil grade, used across tooltips and list items.
    - `CustomYAxisTick`: Custom Y-axis tick renderer for the bump chart, mapping rank positions back to the sorted `OIL_DATA` list to show country name and quality.
    - `MethodologySection`: Static but structured explanation of the reservoir/valuation methodology and 2026 market context, rendered as a large section below the charts.
  - **Derived data and state**
    - Local state: `marketPrice` (Brent benchmark slider) controls the scenario being visualized.
    - `calculatedData` (`useMemo`):
      - Computes adjusted price per barrel based on `marketPrice` vs the baseline.
      - Computes `netProfitPerBbl`, `totalNetValue` (in trillions), and `grossValue` for each `OIL_DATA` entry.
      - Returns a list sorted by `totalNetValue` (highest net asset value first) used by charts and the leaderboard.
    - `bumpChartData` (`useMemo`):
      - Produces three "steps": Physical Capacity, Gross Market Value, Net Profit Value.
      - For each step and country, computes a rank and a `_ribbon` value range used to draw banded areas behind the bump lines.
      - Also precomputes `percentages` and `rawValues` maps consumed by the bump chart tooltips and flag labels.
  - **Charts and visualization**
    - Uses Recharts primitives (`ComposedChart`, `Area`, `Line`, `BarChart`, `Bar`, `ResponsiveContainer`, etc.).
    - **Bump chart section** (`ComposedChart`):
      - X-axis iterates over the three metric "steps".
      - Y-axis shows rank (1–10) with `CustomYAxisTick` providing country labels.
      - For each country:<
        - An `Area` series using the `${country}_ribbon` dataKey draws a band whose vertical width encodes share of the metric.
        - A transparent `Line` series uses `RenderFlagDot` to place a flag marker at each step.
      - `BumpTooltip` consolidates entries by country and shows per-step values using `rawValues` and `percentages`.
    - **Margin analysis section** (`BarChart`):
      - Horizontal stacked bars per country.
      - `extractionCost` and `netProfitPerBbl` are stacked (stackId `"a"`) to visualize cost vs profit margin per barrel.
      - `CustomTooltip` shows capacity, net value, and extraction cost per country.
    - **Leaderboard**:
      - Right-hand column list using `calculatedData`, showing each country, grade badge, qualitative description, and rounded `totalNetValue`.
  - **Layout and typography**
    - The top-level `App` component in this file returns the full dashboard layout:
      - Header and slider control for `marketPrice`.
      - Main grid: bump chart + margin bar chart + net asset leaderboard.
      - Explanatory callouts and the `MethodologySection` below the main visuals.
      - A footer with branding.
    - All layout is built with Tailwind classes; there are no separate layout components or design system abstractions.

### Styling

- `src/index.css`
  - Imports Tailwind CSS via `@import "tailwindcss";` and relies on Tailwind's JIT pipeline configured through the Vite plugin.
- `src/App.css`
  - Default Vite React template styles (e.g., `#root`, `.logo`).
  - Not imported in `main.jsx` or `App.jsx` by default; safe to ignore or remove unless you intentionally wire it back in.

### Notes for future Warp agents

- When making UI or behavior changes, start in `src/oil-dashboard.jsx`; nearly all user-facing logic is colocated there.
- If you add new countries or modify `OIL_DATA`, ensure each record includes consistent fields (`code`, `grade`, `marketPrice`, `extractionCost`, `color`) so charts, badges, and tooltips continue to function.
- Be cautious when changing the shape of `calculatedData` or `bumpChartData`; tooltips, ribbons, and the bump chart lines depend on conventions like `${country}_ribbon`, `percentages`, and `rawValues` keys.
- If the project grows, consider extracting major sections of `src/oil-dashboard.jsx` (e.g., charts, methodology text, leaderboard) into separate components under `src/` for maintainability, but keep their props aligned with the existing data structures.
