import { Routes, Route } from "react-router-dom";
import "./stocks.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import StockNav from "./components/nav/nav";
import StockContent from "./components/stock-content/stock-content";
import ChartView from "./components/chart-view/chart-view";
import StockMap from "./components/stock-map/stock-map";
import React from "react";

const stocksGroups = [
  [
    "Americas",
    new Map([
      ["DIA", "Dow Jones Industrial Average"],
      ["SPY", "SPDR S&P 500 ETF Trust"],
      ["QQQ", "Invesco QQQ Trust"],
      ["EWC", "iShares MSCI Canada ETF"],
    ]),
  ],
  [
    "Europe",
    new Map([
      ["FEZ", "SPDR EURO STOXX 50 ETF"],
      ["EWG", "iShares MSCI Germany ETF"],
      ["EWU", "iShares MSCI United Kingdom ETF"],
      ["EWQ", "iShares MSCI France ETF"],
      ["EWI", "iShares MSCI Italy ETF"],
      ["EWL", "iShares MSCI Switzerland ETF"],
    ]),
  ],
  [
    "Asia Pacific",
    new Map([
      ["EWJ", "iShares MSCI Japan ETF"],
      ["FLCH", "Franklin FTSE China ETF"],
      ["EWA", "iShares MSCI Australia ETF"],
      ["EWH", "iShares MSCI Hong Kong ETF"],
      ["EWT", "iShares MSCI Taiwan ETF"],
      ["EWS", "iShares MSCI Singapore ETF"],
      ["EWY", "iShares MSCI South Korea ETF"],
    ]),
  ],
];

const commoditiesGroups = [
  ["Overview", []],
  [
    "Energy",
    new Map([
      ["USO", "United States Oil Fund"],
      ["UNG", "United States Natural Gas Fund"],
      ["BNO", "United States Brent Oil Fund"],
      ["UGA", "United States Gasoline Fund"],
    ]),
  ],
  [
    "Metals",
    new Map([
      ["GLD", "SPDR Gold Shares"],
      ["SLV", "iShares Silver Trust"],
      ["PALL", "ETFS Physical Palladium Shares"],
      ["PLAT", "ETFS Physical Platinum Shares"],
      ["CPER", "United States Copper Fund"],
      ["LIT", "Global X Lithium & Battery Tech ETF"],
    ]),
  ],
  [
    "Agriculture",
    new Map([
      ["WEAT", "Teucrium Wheat Fund"],
      ["CORN", "Teucrium Corn Fund"],
      ["SOYB", "Teucrium Soybean Fund"],
      ["NIB", "iPath Bloomberg Cocoa"],
      ["CANE", "Teucrium Sugar Fund"],
      ["COW", "ProShares Ultra Bloomberg Livestock"],
    ]),
  ],
];

// nothing behind these APIs are secret, so I'm not worried about exposing them
const API_KEY = "PKSCP2TN43BPC2QT2EGV";
const API_SECRET = "D4msUQFgBKQXsk5q1zESbZMhIsuWYJJYw9DpACZN";
export const BASE_URL = "https://data.alpaca.markets";

export const headers = new Headers({
  "Apca-Api-Key-Id": API_KEY,
  "Apca-Api-Secret-Key": API_SECRET,
});

const Stocks = () => {
  return (
    <div className="stock-page-wrapper">
      <StockNav />
      <div className="stock-content-wrapper">
        <Routes>
          <Route path="/view/*" element={<ChartView />} />
          <Route
            path="/home"
            element={
              <StockContent
                title="Home"
                groups={[]}
                subtitle="Welcome to the home page. Please search for a ticker on the left or navigate to a overview page of your choice."
                showNews={true}
              />
            }
          />
          <Route path="/map" element={<StockMap />} />
          <Route
            path="/stocks"
            element={
              <StockContent
                title="Stocks"
                subtitle=""
                groups={stocksGroups}
                showNews={false}
              />
            }
          />
          <Route
            path="/commodities"
            element={
              <StockContent
                title="Commodities"
                subtitle=""
                groups={commoditiesGroups}
                showNews={false}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Stocks;
