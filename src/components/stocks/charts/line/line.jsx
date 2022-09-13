import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import "./line.css";

const Line = ({ data, parentId, startDate }) => {
  const svgRef = useRef(null);

  let parentDiv = document.getElementById(parentId);
  let width = parentDiv.clientWidth;
  let height = parentDiv.clientHeight;

  const [svgWidth, setWidth] = useState(width);
  const [svgHeight, setHeight] = useState(height);

  const handleResize = () => {
    parentDiv = document.getElementById(parentId);
    setWidth(parentDiv.clientWidth);
    setHeight(parentDiv.clientHeight);
  };

  window.addEventListener("resize", handleResize);

  useEffect(() => {
    // filter out data that is before the start date
    const lineData = data.filter((elem) => elem.time >= new Date(startDate));
    const verticalMargin = 40;
    const horizontalMargin = 40;
    // Create root container where we will append all other chart elements
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements
    const svg = svgEl.append("g");

    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white");

    var xScale = d3
      .scaleTime()
      .domain(d3.extent(lineData, (d) => d.time))
      .range([horizontalMargin, width - horizontalMargin])
      .nice();

    const d3Min = d3.min(lineData.map((elem) => elem.close));
    const d3Max = d3.max(lineData.map((elem) => elem.close));

    const yScale = d3
      .scaleLinear()
      .domain([d3Min * 0.95, d3Max])
      .range([height - verticalMargin, verticalMargin]);

    const volumeScale = d3
      .scaleLinear()
      .domain([0, d3.max(lineData.map((elem) => elem.volume))])
      .range([height - verticalMargin, height - verticalMargin - 0.3 * height]);

    svg
      .append("text")
      .text(`$${d3Max}`)
      .attr("text-anchor", "middle")
      .attr("fill", "green")
      .attr("x", xScale(lineData.find((elem) => elem.close === d3Max).time))
      .attr("y", yScale(d3Max) - 5)
      .attr("font-family", "sans-serif")
      .attr("font-size", "9px");

    svg
      .append("text")
      .text(`$${d3Min}`)
      .attr("text-anchor", "middle")
      .attr("fill", "red")
      .attr("x", xScale(lineData.find((elem) => elem.close === d3Min).time))
      .attr("y", yScale(d3Min) + 12)
      .attr("font-family", "sans-serif")
      .attr("font-size", "9px");

    // Add X grid lines with labels
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(
        (d) =>
          `${d3.timeFormat("%d")(d)}/${d3.timeFormat("%m")(d)}/${d3.timeFormat(
            "%y"
          )(d)}`
      );

    const yAxis = d3
      .axisRight(yScale)
      .tickFormat((d) => `$${d}`)
      .tickSize(-width + 2 * horizontalMargin)
      .tickSizeOuter(0);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - verticalMargin})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", ".8em")
      .attr("transform", "rotate(-30)");

    svg
      .append("g")
      .attr("transform", `translate(${width - horizontalMargin}, 0)`)
      .call(yAxis);
    svg
      .append("line")
      .style("stroke", "green")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "5,2")
      .style("opacity", 1)
      .attr("x1", horizontalMargin)
      .attr("y1", yScale(d3Max))
      .attr("x2", width - horizontalMargin)
      .attr("y2", yScale(d3Max));

    svg
      .append("line")
      .style("stroke", "red")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "5,2")
      .style("opacity", 1)
      .attr("x1", horizontalMargin)
      .attr("y1", yScale(d3Min))
      .attr("x2", width - horizontalMargin)
      .attr("y2", yScale(d3Min));

    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll("circle")
      .data(lineData)
      .join("circle")
      .attr("r", 1.5)
      .attr("cx", (i) => xScale(i.time))
      .attr("cy", (i) => yScale(i.close));

    // draw area
    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "#69b3a2")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "none")
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return xScale(d.time);
          })
          .y0(height - verticalMargin)
          .y1(function (d) {
            return yScale(d.close);
          })
      );

    const horizontalTrackerLine = svg
      .append("line")
      .style("stroke", "black")
      .style("opacity", 1)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0);

    const verticalTrackerLine = svg
      .append("line")
      .style("stroke", "black")
      .style("opacity", 1)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

    const dynamicYLabel = svg
      .append("text")
      .attr("x", 3)
      .attr("y", -3)
      .text("");

    const dynamicXLabel = svg
      .append("text")
      .attr("x", -3)
      .attr("y", -3)
      .text("")
      .attr("text-anchor", "end");

    svg.on("pointermove", (d) => {
      horizontalTrackerLine.attr(
        "transform",
        `translate(0, ${d3.pointer(d)[1]})`
      );
      verticalTrackerLine.attr(
        "transform",
        `translate(${d3.pointer(d)[0]}, 0)`
      );
      dynamicYLabel.attr("transform", `translate(${d3.pointer(d)})`);
      dynamicYLabel.text(`$${yScale.invert(d3.pointer(d)[1]).toFixed(2)}`);
      dynamicXLabel.attr("transform", `translate(${d3.pointer(d)})`);
      dynamicXLabel.text(
        `${d3.timeFormat("%d/%m/%y")(xScale.invert(d3.pointer(d)[0]))}`
      );
    });

    // draw volumes
    svg
      .append("g")
      .attr("fill", "blue")
      .selectAll("rect")
      .data(lineData)
      .join("rect")
      .attr("x", (i) => xScale(i.time))
      .attr("y", (i) => volumeScale(i.volume))
      .attr("height", (i) => height - verticalMargin - volumeScale(i.volume))
      .attr("width", 0.5);

    // Draw the lines
    const line = d3
      .line()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.close));
    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
      .attr("d", (d) => line(d));
  }, [data, svgHeight, svgWidth]); // Redraw chart if data changes

  return (
    <div>
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
    </div>
  );
};

export default Line;
