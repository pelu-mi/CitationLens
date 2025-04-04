import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";

export const InstitutionsBarChart = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Get the container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Set margins
    const margin = { top: 40, right: 20, bottom: 5, left: 280 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Limit the number of institutions to display
    const displayData = data.slice(0, Math.min(data.length, 100));

    // Sort data by count in descending order
    displayData.sort((a, b) => b.count - a.count);

    // Scale for x-axis (counts)
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(displayData, (d) => d.count)])
      .range([0, width]);

    // Scale for y-axis (institutions)
    const y = d3
      .scaleBand()
      .domain(displayData.map((d) => d.key_display_name))
      .range([0, height])
      .padding(0.2);

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create x-axis
    const xAxis = d3.axisTop(x);
    svg
      .append("g")
      .attr("transform", `translate(0, 0)`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Number of Works");

    // Create y-axis with truncated labels if necessary
    const yAxis = d3.axisLeft(y).tickFormat((d, index) => {
      if (index % 3 !== 0) return;

      if (d.length > 50) {
        return d.substring(0, 50) + "...";
      }

      return d;
    });

    svg
      .append("g")
      .call(yAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("font-size", "11px");

    // Create tooltip div
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("z-index", 100);

    // Create bars
    svg
      .selectAll(".bar")
      .data(displayData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.key_display_name))
      .attr("width", (d) => x(d.count))
      .attr("height", y.bandwidth())
      .attr("fill", "#1976d2")
      .attr("position", "relative")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("fill", "#2196f3");

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `
          <strong>${d.key_display_name}</strong><br/>
          Publications: ${d.count.toLocaleString()}
        `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("fill", "#1976d2");

        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Clean up on unmount
    return () => {
      d3.select(containerRef.current).selectAll(".d3-tooltip").remove();
    };
  }, [data]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {!data || data.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body1">No data available</Typography>
        </Box>
      ) : (
        <svg ref={svgRef} width="100%" height="100%" />
      )}
    </Box>
  );
};
