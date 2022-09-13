import ChartGrid from "../chart-grid/chart-grid";
import News from "../news/news";
import {
  subMonths,
  subHours,
  subDays,
  subYears,
  formatRFC3339,
} from "date-fns";
import { useState } from "react";
import { Menu, MenuItem, Classes } from "@blueprintjs/core";
import "./stock-content.css";

import PropTypes from "prop-types";
import { useEffect } from "react";

export const dateConfigs = {
  "24H": subHours(new Date(), 24),
  "7D": subDays(new Date(), 7),
  "30D": subDays(new Date(), 30),
  "6M": subMonths(new Date(), 6),
  "1Y": subYears(new Date(), 1),
};

const StockContent = ({ groups, title, subtitle, showNews }) => {
  const [timeFrame, setTimeFrame] = useState("6M");
  const [startDate, setStartDate] = useState(
    formatRFC3339(dateConfigs[timeFrame])
  );

  useEffect(() => {
    setStartDate(formatRFC3339(dateConfigs[timeFrame]).substring(0, 19) + "Z");
  }, [timeFrame]);

  return (
    <div>
      <div className="stock-content-header">
        <h1>{title}</h1>
        {groups.length ? (
          <Menu className={Classes.ELEVATION_1}>
            <MenuItem text={`Timeframe: ${timeFrame}`}>
              {Array.from(Object.keys(dateConfigs)).map((dateString) => (
                <MenuItem
                  key={dateString}
                  text={dateString}
                  onClick={() => setTimeFrame(dateString)}
                />
              ))}
            </MenuItem>
          </Menu>
        ) : null}
      </div>
      <div className="stock-content-body">
        {subtitle}
        {groups.map((group) => (
          <ChartGrid
            key={group[0]}
            label={group[0]}
            symbols={group[1]}
            startDate={startDate}
          />
        ))}
        {showNews && groups ? <News symbols={[]} /> : null}
      </div>
    </div>
  );
};

export default StockContent;

StockContent.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  groups: PropTypes.arrayOf(PropTypes.array).isRequired,
  showNews: PropTypes.bool.isRequired,
};
