import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";

export const InstitutionsBarChart = ({ data }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const xAxisRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous content
    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(xAxisRef.current).selectAll("*").remove();

    // Get the container dimensions
    const containerWidth = containerRef.current.clientWidth;

    // Set margins
    const margin = { top: 10, right: 80, bottom: 10, left: 250 };
    const width = containerWidth - margin.left - margin.right;

    // Bar height and spacing
    const barHeight = 25;
    const barSpacing = 10;
    const totalBarHeight = barHeight + barSpacing;

    // Sort data by count in descending order
    const sortedData = [...data].sort((a, b) => b.count - a.count);

    // Calculate total height needed for all bars
    const totalHeight = sortedData.length * totalBarHeight;

    // Scale for x-axis (counts)
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.count)])
      .range([0, width]);

    // Create fixed x-axis at top
    const xAxisSvg = d3
      .select(xAxisRef.current)
      .attr("width", containerWidth)
      .attr("height", 60)
      .append("g")
      .attr("transform", `translate(${margin.left}, 55)`);

    const xAxis = d3.axisTop(x).ticks(10);
    xAxisSvg
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Number of Works");

    // Create the scrollable chart
    const chartSvg = d3
      .select(chartRef.current)
      .attr("width", containerWidth)
      .attr("height", totalHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`);

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

    // Create bars and labels in the scrollable area
    sortedData.forEach((d, i) => {
      const yPosition = i * totalBarHeight;

      // Institution label
      chartSvg
        .append("text")
        .attr("x", -10)
        .attr("y", yPosition + barHeight / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .text(() => {
          if (d.key_display_name.length > 35) {
            return d.key_display_name.substring(0, 35) + "...";
          }
          return d.key_display_name;
        })
        .append("title") // Add full name as tooltip
        .text(d.key_display_name);

      // Bar
      chartSvg
        .append("rect")
        .attr("x", 0)
        .attr("y", yPosition)
        .attr("width", x(d.count))
        .attr("height", barHeight)
        .attr("fill", "#1976d2")
        .attr("rx", 3) // Rounded corners
        .attr("position", "relative")
        .on("mouseover", function (event) {
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

      // Count label
      chartSvg
        .append("text")
        .attr("x", x(d.count) + 5)
        .attr("y", yPosition + barHeight / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "11px")
        .attr("fill", "gray")
        .text(d.count.toLocaleString());
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fixed header with x-axis */}
      <Box
        sx={{
          height: "60px",
          width: "100%",
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 2,
        }}
      >
        <svg ref={xAxisRef} />
      </Box>

      {/* Scrollable chart content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bbbbbb",
            borderRadius: "4px",
          },
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
            No data available
          </Box>
        ) : (
          <svg ref={chartRef} width="100%" />
        )}
      </Box>
    </Box>
  );
};
