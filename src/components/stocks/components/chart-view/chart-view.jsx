import { useParams } from "react-router-dom";
import { useState } from "react";

import Line from "../../charts/line/line";
import { useEffect } from "react";

import News from "../news/news";

import "./chart-view.css";

import { BASE_URL, headers } from "../../stocks";
import { formatRFC3339, subDays } from "date-fns";

import { Menu, MenuItem, Classes } from "@blueprintjs/core";
import { dateConfigs } from "../stock-content/stock-content";
import { calculateChangeLabel } from "../chart-grid/chart-grid";

const formatDateString = (date) => formatRFC3339(date).substring(0, 19) + "Z";

const ChartView = () => {
  const queryParams = useParams();
  const [selectedTicker] = useState(queryParams["*"]);
  const [data, setData] = useState([]);

  const [nDay] = useState(10);

  const [timeFrame, setTimeFrame] = useState("30D");
  const [startDate, setStartDate] = useState(
    formatDateString(dateConfigs[timeFrame])
  );

  const [loading, setLoading] = useState(true);

  const [changeLabel, setChangeLabel] = useState("NAN");

  useEffect(() => {
    if (!data || !data.length) return;
    const first = data[0];
    const last = data[data.length - 1];
    setChangeLabel(calculateChangeLabel(first.close, last.close));
    setLoading(false);
  }, [data]);

  // TODO: timeframe logic
  useEffect(() => {
    setStartDate(formatDateString(dateConfigs[timeFrame]));
  }, [timeFrame]);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${BASE_URL}/v2/stocks/${selectedTicker}/bars?start=${formatDateString(
        subDays(dateConfigs[timeFrame], nDay)
      )}&timeframe=1Hour&limit=10000`,
      {
        method: "GET",
        headers,
      }
    )
      .then((res) => res.json())
      .then((data) =>
        data?.bars
          ? data.bars.map(
              (elem) =>
                ({ time: new Date(elem.t), close: elem.c, volume: elem.v } ||
                [])
            )
          : []
      )
      .then((data) => data.sort((a, b) => (a.time > b.time ? 1 : -1)))
      .then(setData);
  }, [selectedTicker, startDate]);

  const divId = `large-line-chart-${selectedTicker}`;
  return (
    <div>
      <div className="stock-content-header">
        <h1>
          View {">"} {selectedTicker}
        </h1>
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
      </div>
      <div className="stock-content-body">
        <h2 className={loading ? Classes.SKELETON : null}>{changeLabel}</h2>
        <div
          className={`stock-chart-view-wrapper ${
            loading ? Classes.SKELETON : null
          }`}
          id={divId}
        >
          {data.length ? (
            <Line startDate={startDate} data={data} parentId={divId} />
          ) : null}
        </div>
        <News symbols={[selectedTicker]} />
      </div>
    </div>
  );
};

export default ChartView;
