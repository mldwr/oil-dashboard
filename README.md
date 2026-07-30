# Oil Dashboard

An interactive visualization dashboard for analyzing oil pricing relationships, specifically focusing on the correlation between Brent Crude benchmarks and various country-specific crude grades. This project uses historical data to model price adjustments rather than theoretical formulas, providing a data-driven view of market dynamics.

## 🚀 Project Overview

The **Oil Dashboard** allows users to explore how changes in the global Brent Crude market price impact the value of specific crude grades from countries like Saudi Arabia, USA, Canada, and others. It calculates adjusted prices, profit margins, and total reserve values based on real historical pricing data.

## ✨ Key Features

*   **Historical Pricing Model**: Uses a "lookup" approach based on actual historical data to determine price correlations, ensuring realistic modeling of spreads.
*   **Interactive Market Simulation**: A central control panel allows users to adjust the Brent Crude market price and see real-time updates across all visualizations.
*   **Comprehensive Visualizations**:
    *   **World Oil Map**: Geospatial view of oil production and pricing.
    *   **Bump Chart**: Rankings of crude grades by different metrics (Capacity, Market Value, Profit).
    *   **Margin Analysis**: Detailed breakdown of lifting costs vs. net profit.
    *   **Profit Sensitivity**: Analysis of how profit margins respond to price changes.
    *   **Key Insights**: Automated analysis of high-margin and low-margin producers.
*   **Dynamic Metrics**: Real-time calculation of Net Profit per Barrel and Total Net Value (in Trillions USD) based on reserve capacity.

## 🛠️ Technology Stack

*   **Frontend Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Charts & Visualization**:
    *   [Recharts](https://recharts.org/) for statistical charts.
    *   [react-simple-maps](https://www.react-simple-maps.io/) for geospatial data.
*   **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd oil-dashboard
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Open in browser**
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage

1.  **Adjust Market Price**: Use the slider in the "Parameter Control" panel to change the hypothetical Brent Crude price.
2.  **Explore Data**:
    *   Hover over the **World Map** to see country-specific stats.
    *   Analyze the **Margin Analysis** chart to compare lifting costs against profits.
    *   View the **Bump Chart** to see how country rankings shift as prices change (e.g., high-cost producers might drop in ranking when prices fall).
3.  **Review Methodology**: Check the "Methodology" section at the bottom of the dashboard for details on the data sources and calculation logic.

## 📂 Project Structure

```text
src/
├── components/          # React components (Charts, Maps, UI controls)
├── data/                # CSV data files and processed JSON constants
├── utils/               # Logic for pricing models and data parsing
├── assets/              # Static assets (images, icons)
├── App.jsx              # Main application entry point
└── oil-dashboard.jsx    # Dashboard layout and state management
```

## 📚 Documentation

For a deep dive into how the historical pricing model works, please refer to the developer guide:
*   [Historical Price Calculation Guide](docs/HISTORICAL_PRICE_CALCULATION_DEV.md)
