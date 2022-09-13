import { useRef, useState, useEffect } from "react";
import { Button, Classes } from "@blueprintjs/core";

import skiAreas from "./response.json";

import mapboxgl from "mapbox-gl";

import "./ski-map.css";

const API_KEY = `pk.eyJ1IjoidG9tb3R0ZXIiLCJhIjoiY2oza2Vka2gwMDAycDJ3cXBpZGtwdTkwYSJ9.AD__smT64vjUdsp0suXBNg`;
mapboxgl.accessToken = API_KEY;

const SkiMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(9);
  const [lat] = useState(46.5);
  const [zoom] = useState(6);

  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [lng, lat],
      pitch: 35,
      zoom: zoom,
    });

    map.current.on("click", function (e) {
      var features = map.current.queryRenderedFeatures(e.point, {
        layers: ["road-path-bg"],
      });
      if (!features.length) {
        return;
      }
      if (typeof map.current.getLayer("selectedRoad") !== "undefined") {
        map.current.removeLayer("selectedRoad");
        map.current.removeSource("selectedRoad");
      }
      var feature = features[0];
      //I think you could add the vector tile feature to the map, but I'm more familiar with JSON
      map.current.addSource("selectedRoad", {
        type: "geojson",
        data: feature.toJSON(),
      });
      map.current.addLayer({
        id: "selectedRoad",
        type: "line",
        source: "selectedRoad",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "yellow",
          "line-width": 8,
        },
      });
    });

    map.current.on("load", () => {
      map.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
      });
      // add the DEM source as a terrain layer with exaggerated height
      map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1 });

      // add sky styling with `setFog` that will show when the map is highly pitched
      map.current.setFog({
        "horizon-blend": 0.3,
        color: "white",
        "high-color": "#add8e6",
        "space-color": "#d8f2ff",
        "star-intensity": 0.0,
      });

      map.current.addLayer({
        id: "pistes-highlighted",
        type: "line",
        source: "composite",
        "source-layer": "road",
        paint: {
          "line-color": "#484896",
          "line-width": 4,
        },
        filter: ["any", ["in", "piste", ["get", "type"]]],
      });

      map.current.loadImage(
        "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
        (error, image) => {
          if (error) throw error;

          map.current.addImage("custom-marker", image);

          map.current.addSource("points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: skiAreas.reduce((acc, entry) => {
                const area = entry.SkiArea;
                if (
                  area &&
                  area.name &&
                  area.geo_lat &&
                  area.geo_lng &&
                  area.has_downhill
                ) {
                  return [
                    ...acc,
                    {
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: [area.geo_lng, area.geo_lat],
                      },
                      properties: {
                        title:
                          area.name.length > 15
                            ? area.name.substring(0, 12) + "..."
                            : area.name,
                      },
                    },
                  ];
                } else {
                  return acc;
                }
              }, []),
            },
          });

          map.current.addLayer({
            id: "points-label",
            type: "symbol",
            source: "points",
            minzoom: 9,
            layout: {
              "text-field": ["get", "title"],
              "text-offset": [0, 0.5],
              "text-anchor": "top",
              "icon-allow-overlap": true,
              "text-allow-overlap": true,
            },
          });

          map.current.addLayer({
            id: "points-img",
            type: "symbol",
            source: "points",
            layout: {
              "icon-image": "custom-marker",
              "icon-size": 0.25,
              "icon-allow-overlap": true,
              "text-allow-overlap": true,
            },
          });
        }
      );
    });
  }, []);

  useEffect(() => {
    console.log("selectedArea", selectedArea);
    // fetch("https://skimap.org/SkiAreas/index.json", {
    //   method: "GET",
    //   mode: "no-cors",
    //   headers: new Headers({
    //     Accept: "*/*",
    //   }),
    // }).then(console.log);
  }, [selectedArea]);

  return (
    <div>
      <Button
        className={Classes.MINIMAL}
        text="Espace Killy"
        onClick={() => {
          setSelectedArea("Espace Killy");
        }}
      />
      <Button
        className={Classes.MINIMAL}
        text="Les 3 Vallees"
        onClick={() => {
          map.current.flyTo({
            center: { lat: 45.48402, lng: 6.5257 },
            duration: 2000,
            zoom: 12,
            essential: true, // this animation is considered essential with respect to prefers-reduced-motion
          });
        }}
      />
      <div className="map-container">
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
};

export default SkiMap;
