import "./stock-map.css";
import "mapbox-gl/dist/mapbox-gl.css";

import * as wc from "which-country";

import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Button, Spinner } from "@blueprintjs/core";

import mapboxgl from "mapbox-gl";
// nothing to hide here so we can just keep the token in the code
const API_KEY = `pk.eyJ1IjoidG9tb3R0ZXIiLCJhIjoiY2oza2Vka2gwMDAycDJ3cXBpZGtwdTkwYSJ9.AD__smT64vjUdsp0suXBNg`;
mapboxgl.accessToken = API_KEY;

import { BASE_URL, headers } from "../../stocks";

import { codeToTicker, mapSymbols } from "./map-symbols";
import { dateConfigs } from "../stock-content/stock-content";

import { formatRFC3339 } from "date-fns";
import React from "react";

const StockMap = () => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(9);
  const [lat] = useState(46.5);
  const [zoom] = useState(4);

  const [timeFrame] = useState("30D");
  const [startDate] = useState(
    formatRFC3339(dateConfigs[timeFrame]).substring(0, 19) + "Z"
  );

  const [data, setData] = useState([]);
  const [formattedData, setFormattedData] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [ticker, setTicker] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!ticker) return;
  }, [ticker]);

  useEffect(() => {
    if (data) {
      setFormattedData(
        Object.entries(data).reduce((prev: any, [ticker, curr]: any) => {
          curr = curr.sort((a, b) => (a.t > b.t ? 1 : -1));
          const first = curr[0];
          const last = curr[curr.length - 1];
          return [
            ...prev,
            {
              ticker,
              code: mapSymbols.get(ticker),
              direction: last.c > first.c ? "up" : "down",
              percentageChange: Math.abs(
                ((first.c - last.c) * 100) / first.c
              ).toFixed(2),
            },
          ] as any;
        }, []) as any
      );
    }
  }, [data]);

  useEffect(() => {
    fetch(
      `${BASE_URL}/v2/stocks/bars?symbols=${Array.from(mapSymbols.keys()).join(
        ","
      )}&start=${startDate}&timeframe=1Hour&limit=10000`,
      { method: "GET", headers }
    )
      .then((res) => res.json())
      .then((res) => setData(res.bars));
  }, [timeFrame]);

  useEffect(() => {
    if (map.current || !formattedData || !(formattedData as any).length) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v8",
      pitch: 0,
      center: [lng, lat],
      zoom: zoom,
      projection: "globe",
    });

    map.current.on("click", "countries", (e) => {
      const ticker = codeToTicker.get(wc([e.lngLat.lng, e.lngLat.lat]));
      if (!ticker) return;
      setTicker(ticker as any);
      setAlertOpen(true);
    });
    setLoading(false);

    map.current.on("load", () => {
      map.current.setFog({
        "horizon-blend": 0.3,
        color: "white",
        "high-color": "#add8e6",
        "space-color": "#d8f2ff",
        "star-intensity": 0.0,
      });

      map.current.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      map.current.addLayer({
        id: "countries",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        type: "fill",
        filter: [
          "all",
          [
            "any",
            ["==", "all", ["get", "worldview"]],
            ["in", "US", ["get", "worldview"]],
          ],
          [
            "in",
            ["get", "iso_3166_1_alpha_3"],
            [
              "literal",
              (formattedData as any).map((elem) => mapSymbols.get(elem.ticker)),
            ],
          ],
        ],
        paint: {
          "fill-color": [
            "case",
            [
              "in",
              ["get", "iso_3166_1_alpha_3"],
              [
                "literal",
                (formattedData as any)
                  .filter((elem) => elem.direction === "up")
                  .map((elem) => mapSymbols.get(elem.ticker)),
              ],
            ],
            "rgba(0,255,0,0.5)",
            "rgba(255,0,0,0.5)",
          ],
          "fill-outline-color": "black",
        },
      });
      map.current.on("mouseenter", "countries", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "countries", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });
  }, [formattedData]);

  return (
    <>
      <Alert
        confirmButtonText="Okay"
        isOpen={alertOpen}
        canOutsideClickCancel={true}
        canEscapeKeyCancel={true}
        onClose={() => setAlertOpen(false)}
      >
        <h2>{mapSymbols.get(ticker as any)}</h2>
        <h4>{ticker}</h4>
        <p>
          {(() => {
            if (!formattedData || !(formattedData as any).length) return null;
            const elem = (formattedData as any).find(
              (elem) => elem.ticker === ticker
            );
            if (!elem) return;
            return `${elem.direction === "up" ? "Up" : "Down"} ${
              elem.percentageChange
            }% in the last ${timeFrame}`;
          })()}
        </p>
        <Button onClick={() => navigate(`/stocks/view/${ticker}`)}>
          View {ticker}
        </Button>
      </Alert>
      <div className="map-container">
        {loading ? (
          <div className="spinner">
            <Spinner />
          </div>
        ) : (
          ""
        )}
        <div ref={mapContainer} className="map-container" />
      </div>
    </>
  );
};

export default StockMap;
