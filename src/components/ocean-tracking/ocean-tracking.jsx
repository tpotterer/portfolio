import { useRef, useState, useEffect } from "react";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import { Suggest2 } from "@blueprintjs/select";
import { MenuItem } from "@blueprintjs/core";
import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl from "mapbox-gl";

import "./ocean-tracking.css";

const API_KEY = `pk.eyJ1IjoidG9tb3R0ZXIiLCJhIjoiY2oza2Vka2gwMDAycDJ3cXBpZGtwdTkwYSJ9.AD__smT64vjUdsp0suXBNg`;
mapboxgl.accessToken = API_KEY;

const VESSEL_API_URL =
  "https://gateway.api.globalfishingwatch.org/v2/vessels/advanced-search?datasets=public-global-carrier-vessels:latest,public-global-fishing-vessels:latest,public-global-support-vessels:latest";

const getEventAPIUrls = (id) =>
  [
    "public-global-fishing-events:latest",
    "public-global-encounters-events:latest",
    "public-global-loitering-events-carriers:latest",
    "public-global-port-visits-c2-events:latest",
  ].map(
    (dataset) =>
      `https://gateway.api.globalfishingwatch.org/v2/events?vessels=${id}&datasets=${dataset}&limit=10000&offset=0sort=-start`
  );
const headers = {
  method: "GET",
  headers: new Headers({
    Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiIyMDIyXzA4XzI4IiwidXNlcklkIjoyMDEwNywiYXBwbGljYXRpb25OYW1lIjoiMjAyMl8wOF8yOCIsImlkIjoxNTIsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTY2MTcwMTAyNiwiZXhwIjoxOTc3MDYxMDI2LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.QqSfrRZivYo7SgqgU-uY9ntjuOo9CY02zdJbiLWaLTMhzMQSx7MHzWIaSFnDDTNf0KlHyghWdXWykOFWFTIoyW4dp8aQv72qtI8POHbjLaZtCd8OBEq4xsZ0hDZSq5jDiCp46yUSG1e2dbc8A4w9_2fUA-48FJOgpswKEWBfk2QKMWT8W9jLOX2t57N2Hj4PCNqm9wmMzFaoljg1aUEbSjNb5evErMtF-HruWeQbCQBGqvu9Po4P1V8g4rIQtYGfPy5a4C9o5xNQ8sIAFijEfhA6uqbUKPUcSc3IQTCX_4mM3JhQuZlMO7rpucZBC77tiOvVJ_W9h-RB9a6DMtd0EczjPswLX_6f-N1xK0qekRAzvvuSnPQJqFD1SZkg6C-SAdS2-qHJCF6RrgXqiRKcdDeMYnmynLv2FU24WmEuE8cRknGgXFN9FH0VbeXLoW3nxyYqMGTNt1qh9ouae7FSycEKaH6nVTgQDf1efi0eytvcz-r0ABsHgtnwt_JWUQjw`,
    "Content-Type": "application/x-www-form-urlencoded",
  }),
};

const eventTypeToClassName = new Map([
  ["fishing", "marker-fishing"],
  ["encounter", "marker-encounter"],
  ["port_visit", "marker-port-visit"],
  ["loitering", "marker-loitering"],
]);

const OceanTracking = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(9);
  const [lat] = useState(46.5);
  const [zoom] = useState(3);

  const [searchInput, setSearchInput] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [events, setEvents] = useState([]);

  let currentMarkers = [];
  let currentLayers = [];
  let currentSources = [];

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [lng, lat],
        zoom: zoom,
        projection: "globe",
      });

      map.current.on("click", function (e) {
        console.log(e);
      });

      map.current.on("load", () => {
        map.current.setFog({
          color: "rgb(186, 210, 235)", // Lower atmosphere
          "high-color": "rgb(36, 92, 223)", // Upper atmosphere
          "horizon-blend": 0.02, // Atmosphere thickness (default 0.2 at low zooms)
          "space-color": "rgb(11, 11, 25)", // Background color
          "star-intensity": 0.6, // Background star brightness (default 0.35 at low zoooms )
        });
      });
    }
  }, [map]);
  useEffect(() => {
    if (!searchInput) return;
    const rawQueryString = `shipname LIKE '%${searchInput}%'`;
    setSearchLoading(true);
    setSearchOptions([]);
    fetch(
      `${VESSEL_API_URL}&query=${encodeURIComponent(
        rawQueryString
      )}&limit=5&offset=0`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiIyMDIyXzA4XzI4IiwidXNlcklkIjoyMDEwNywiYXBwbGljYXRpb25OYW1lIjoiMjAyMl8wOF8yOCIsImlkIjoxNTIsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTY2MTcwMTAyNiwiZXhwIjoxOTc3MDYxMDI2LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.QqSfrRZivYo7SgqgU-uY9ntjuOo9CY02zdJbiLWaLTMhzMQSx7MHzWIaSFnDDTNf0KlHyghWdXWykOFWFTIoyW4dp8aQv72qtI8POHbjLaZtCd8OBEq4xsZ0hDZSq5jDiCp46yUSG1e2dbc8A4w9_2fUA-48FJOgpswKEWBfk2QKMWT8W9jLOX2t57N2Hj4PCNqm9wmMzFaoljg1aUEbSjNb5evErMtF-HruWeQbCQBGqvu9Po4P1V8g4rIQtYGfPy5a4C9o5xNQ8sIAFijEfhA6uqbUKPUcSc3IQTCX_4mM3JhQuZlMO7rpucZBC77tiOvVJ_W9h-RB9a6DMtd0EczjPswLX_6f-N1xK0qekRAzvvuSnPQJqFD1SZkg6C-SAdS2-qHJCF6RrgXqiRKcdDeMYnmynLv2FU24WmEuE8cRknGgXFN9FH0VbeXLoW3nxyYqMGTNt1qh9ouae7FSycEKaH6nVTgQDf1efi0eytvcz-r0ABsHgtnwt_JWUQjw`,
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => setSearchOptions(data?.entries || []))
      .then(() => setSearchLoading(false));
  }, [searchInput]);
  useEffect(() => {
    if (!selectedOption || !selectedOption.id) return;

    const fetchData = async (url) =>
      await fetch(url, headers)
        .then((res) => res.json())
        .then((data) => data?.entries || []);

    const urls = getEventAPIUrls(selectedOption.id);

    Promise.all([
      fetchData(urls[0]),
      fetchData(urls[1]),
      fetchData(urls[2]),
      fetchData(urls[3]),
    ])
      .then(([fishing, encounter, loitering, portVisit]) =>
        [...fishing, ...encounter, ...loitering, ...portVisit]
          .sort((a, b) => (a.start < b.start ? -1 : 1))
          .slice(0, 250)
      )
      .then(setEvents);
  }, [selectedOption]);

  useEffect(() => {
    if (events.length) {
      currentLayers.forEach((id) => map.current.removeLayer(id));
      currentSources.forEach((id) => map.current.removeSource(id));
      currentMarkers.forEach((marker) => marker.remove());

      currentLayers = [];
      currentMarkers = [];
      currentSources = [];

      events.forEach((event) => {
        const el = document.createElement("div");
        el.className = eventTypeToClassName.get(event.type) || "marker-unknown";
        const marker = new mapboxgl.Marker(el)
          .setLngLat(event.position)
          .addTo(map.current)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(`<h3>${event.type}</h3><p>${event.start}</p>`)
          );
        currentMarkers.push(marker);
      });
      const time = new Date().toISOString();
      const id = `route_${time}`;
      map.current.addSource(id, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: events.map((event) => [
              event.position.lon,
              event.position.lat,
            ]),
          },
        },
      });
      map.current.addLayer({
        id,
        type: "line",
        source: id,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "orange",
          "line-width": 4,
        },
      });
      currentSources.push(id);
      currentLayers.push(id);
    }
  }, [events]);
  return (
    <div>
      <div className="search-container">
        <Suggest2
          items={searchOptions}
          itemRenderer={renderShip}
          itemListPredicate={(query) => {
            setSearchInput(query);
            return searchOptions;
          }}
          minimal={true}
          onItemSelect={setSelectedOption}
          noResults={
            <MenuItem
              disabled={true}
              text={searchLoading ? "Loading..." : "No results."}
            />
          }
          s
          popoverProps={{ matchTargetWidth: true, minimal: true }}
          inputValueRenderer={generateShipLabel}
        />
      </div>
      <div className="map-container">
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
};

const generateShipLabel = (ship) =>
  `${ship.shipname
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")}${ship.imo ? ` - ${ship.imo}` : ""}`;

const renderShip = (ship, { handleClick, modifiers }) => {
  const text = generateShipLabel(ship);
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      onClick={handleClick}
      label={text}
      key={ship.id}
    />
  );
};

export default OceanTracking;
