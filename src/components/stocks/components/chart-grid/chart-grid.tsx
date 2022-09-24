import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { BASE_URL, headers } from "../../stocks";
import { Card, Elevation, Classes } from "@blueprintjs/core";
import MiniLineChart from "../../charts/mini-line/mini-line";

import { useNavigate } from "react-router-dom";

import "./chart-grid.css";
import React from "react";

export const calculateChangeLabel = (first, last) => (
  <span style={{ color: first < last ? "green" : "red" }}>{`${
    first < last ? "▲" : "▼"
  }${Math.abs(((first - last) * 100) / first).toFixed(2)}%`}</span>
);

const ChartGrid = ({ symbols, label, startDate }) => {
  const [stocks] = useState(symbols);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!startDate) return;
    setData([]);
    Promise.all(
      Array.from(symbols.keys()).map((symbol) =>
        fetch(
          `${BASE_URL}/v2/stocks/${symbol}/bars?start=${startDate}&timeframe=1Hour&limit=2000`,
          {
            method: "GET",
            headers,
          }
        )
          .then((res) => res.json())
          .then((data) =>
            data?.bars
              ? data.bars.map((elem) => ({ time: elem.t, close: elem.c } || []))
              : []
          )
          .then((data) => ({
            values: data.sort((a, b) => (a.time > b.time ? 1 : -1)),
            symbol,
          }))
      )
    ).then(setData as any);
  }, [stocks, startDate]);
  return (
    <div>
      <h2>{label}</h2>
      <div className="stock-card-grid">
        {Array.from(symbols.keys()).map((symbol, idx) => {
          const found: any = data.find((elem: any) => elem.symbol === symbol);
          const id = `stock-card-${idx}-${symbol}`;
          if (found) {
            if (found.values.length <= 0) {
              return;
            }
            const first = found.values[0];
            const last = found.values[found.values.length - 1];
            return (
              <div key={id} className="stock-card-wrapper">
                <div className="stock-card-header">
                  {symbol} - {calculateChangeLabel(first.close, last.close)}
                  <br />
                  {symbols.get(symbol)}
                </div>
                <Card
                  elevation={Elevation.TWO}
                  className="stock-card"
                  id={id}
                  interactive={true}
                  onClick={() => navigate(`/stocks/view/${symbol}`)}
                >
                  <MiniLineChart data={found} parentId={id} />
                </Card>
              </div>
            );
          }
          return (
            <Card
              elevation={Elevation.TWO}
              className={`${"stock-card"} ${Classes.SKELETON}`}
              id={id}
              key={id}
            />
          );
        })}
      </div>
    </div>
  );
};

ChartGrid.propTypes = {
  symbols: PropTypes.any.isRequired,
  label: PropTypes.string.isRequired,
  startDate: PropTypes.any.isRequired,
};

export default ChartGrid;
