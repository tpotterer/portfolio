import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

const MiniLineChart = ({ data, parentId }) => {
  const svgRef = useRef(null);

  const [svgWidth, setWidth] = useState(0);
  const [svgHeight, setHeight] = useState(0);

  const handleResize = () => {
    const newParentDiv = document.getElementById(parentId);
    if (!newParentDiv) return;
    setWidth(newParentDiv.clientWidth);
    setHeight(newParentDiv.clientHeight);
  };

  useEffect(() => {
    handleResize();
  }, [data]);
  window.addEventListener("resize", handleResize);

  useEffect(() => {
    if (svgHeight == 0 || svgWidth == 0) return;
    const verticalMargin = 25;
    const horizontalMargin = 25;
    const height = svgHeight;
    const width = svgWidth;
    // Create root container where we will append all other chart elements
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements
    const svg = svgEl.append("g");

    var xScale = d3
      .scaleTime()
      .domain(d3.extent(data.values, (d) => new Date(d.time)))
      .range([horizontalMargin, width - horizontalMargin])
      .nice();

    const d3Min = d3.min(data.values.map((elem) => elem.close));
    const d3Max = d3.max(data.values.map((elem) => elem.close));

    const yScale = d3
      .scaleLinear()
      .domain([d3Min * 0.95, d3Max])
      .range([height - verticalMargin, verticalMargin]);

    svg
      .append("text")
      .text(`$${d3Max}`)
      .attr("text-anchor", "middle")
      .attr("fill", "green")
      .attr(
        "x",
        xScale(new Date(data.values.find((elem) => elem.close === d3Max).time))
      )
      .attr("y", yScale(d3Max) - 5)
      .attr("font-family", "sans-serif")
      .attr("font-size", "9px");

    svg
      .append("text")
      .text(`$${d3Min}`)
      .attr("text-anchor", "middle")
      .attr("fill", "red")
      .attr(
        "x",
        xScale(new Date(data.values.find((elem) => elem.close === d3Min).time))
      )
      .attr("y", yScale(d3Min) + 12)
      .attr("font-family", "sans-serif")
      .attr("font-size", "9px");

    // Add X grid lines with labels
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(3)
      .tickSizeOuter(0)
      .tickFormat(
        (d) =>
          `${d3.timeFormat("%d")(d)}/${d3.timeFormat("%m")(d)}/${d3.timeFormat(
            "%y"
          )(d)}`
      );
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - verticalMargin})`)
      .call(xAxis);
    svg
      .append("line")
      .style("stroke", "green")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "5,2")
      .attr("x1", horizontalMargin)
      .attr("y1", yScale(d3Max))
      .attr("x2", width - horizontalMargin)
      .attr("y2", yScale(d3Max));

    svg
      .append("line")
      .style("stroke", "red")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "5,2")
      .attr("x1", horizontalMargin)
      .attr("y1", yScale(d3Min))
      .attr("x2", width - horizontalMargin)
      .attr("y2", yScale(d3Min));

    // Draw the lines
    const line = d3
      .line()
      .x((d) => xScale(new Date(d.time)))
      .y((d) => yScale(d.close));
    svg
      .append("path")
      .datum(data.values)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
      .attr("d", (d) => line(d));
  }, [data, svgWidth, svgHeight]); // Redraw chart if data changes

  return <svg ref={svgRef} width={svgWidth} height={svgHeight} />;
};

MiniLineChart.propTypes = {
  data: PropTypes.object,
  parentId: PropTypes.string,
};

export default MiniLineChart;
