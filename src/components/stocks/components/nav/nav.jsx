import "./nav.css";

import { useState, useEffect } from "react";
import { Suggest2 } from "@blueprintjs/select";
import { MenuItem } from "@blueprintjs/core";

import { useNavigate } from "react-router-dom";

import { searchOptions as knownOptions } from "./search-options";

const StockNav = () => {
  const [selectedStock, setSelectedStock] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedStock) {
      navigate(`/stocks/view/${selectedStock[0]}`);
    }
  }, [selectedStock]);

  return (
    <div className="stock-nav-wrapper">
      <div className="stock-nav-content">
        <h1>Search</h1>
        <Suggest2
          items={knownOptions}
          itemRenderer={renderItem}
          itemPredicate={filterItem}
          minimal={true}
          onItemSelect={(item) => setSelectedStock(item)}
          noResults={<MenuItem disabled={true} text={"No results."} />}
          popoverProps={{ matchTargetWidth: false, minimal: true }}
          inputValueRenderer={(item) => item[0]}
        />
      </div>
      <div className="stock-nav-divider"></div>
      <div className="stock-nav-body">
        <h2>
          <a onClick={() => navigate("/stocks/home")}>Home</a>
        </h2>
        <h2>Markets</h2>
        <a onClick={() => navigate("/stocks/map")}>World Map</a>
        <a onClick={() => navigate("/stocks/stocks")}>Stocks</a>
        <a onClick={() => navigate("/stocks/commodities")}>Commodities</a>
        {/* <a onClick={() => navigate("/stocks/crypto")}>Cryptocurrencies</a> */}
      </div>
      <div className="stock-nav-divider"></div>
    </div>
  );
};

export const filterItem = (query, item) => {
  const normalizedTicker = item[0].toLowerCase();
  const normalizedName = item[1].toLowerCase();
  const normalizedQuery = query.toLowerCase();
  return `${normalizedTicker} ${normalizedName}`.indexOf(normalizedQuery) >= 0;
};

const renderItem = (item, { handleClick, modifiers }) => {
  const text = `${item[0]} - ${item[1]}`;
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      onClick={handleClick}
      label={text}
      key={text}
    />
  );
};

export default StockNav;
