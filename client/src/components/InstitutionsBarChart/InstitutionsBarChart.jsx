import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";

export const InstitutionsBarChart = ({ data }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const xAxisRef = useRef(null);
  const tooltipRef = useRef(null);

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
      .attr("height", 50)
      .append("g")
      .attr("transform", `translate(${margin.left}, 45)`);

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

    // Create tooltip div if it doesn't exist
    let tooltip = d3.select(containerRef.current).select(".d3-tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select(containerRef.current)
        .append("div")
        .attr("class", "d3-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
        .style("pointer-events", "none")
        .style("z-index", 100)
        .style("max-width", "300px");
      tooltipRef.current = tooltip.node();
    }

    // Create a group for each institution (containing label and bar)
    const institutions = chartSvg
      .selectAll(".institution-group")
      .data(sortedData)
      .enter()
      .append("g")
      .attr("class", "institution-group")
      .attr("transform", (d, i) => `translate(0, ${i * totalBarHeight})`)
      .style("opacity", 1);

    // Institution label
    institutions
      .append("text")
      .attr("class", "institution-label")
      .attr("x", -10)
      .attr("y", barHeight / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .text((d) => {
        if (d.key_display_name.length > 35) {
          return d.key_display_name.substring(0, 35) + "...";
        }
        return d.key_display_name;
      })
      .append("title") // Add full name as tooltip
      .text((d) => d.key_display_name);

    // Bar
    institutions
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", (d) => x(d.count))
      .attr("height", barHeight)
      .attr("fill", "#1976d2")
      .attr("rx", 3); // Rounded corners

    // Count label
    institutions
      .append("text")
      .attr("class", "count-label")
      .attr("x", (d) => x(d.count) + 5)
      .attr("y", barHeight / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("fill", "gray")
      .text((d) => d.count.toLocaleString());

    // Get scrollable container
    const scrollContainer = d3
      .select(containerRef.current)
      .select("div")
      .node();

    // Add hover interaction to the entire group
    institutions
      .on("mouseover", function (event, d) {
        // First, make tooltip visible but fully transparent for measurement
        tooltip.style("opacity", 0).style("visibility", "visible");

        // Set tooltip content
        tooltip.html(`
          <strong>${d.key_display_name}</strong><br/>
          Publications: ${d.count.toLocaleString()}
        `);

        // Get important measurements
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const scrollbarWidth =
          scrollContainer.offsetWidth - scrollContainer.clientWidth;
        const xAxisHeight = 60; // Height of the x-axis area

        // Get element position
        const groupNode = this;
        const groupRect = groupNode.getBoundingClientRect();

        // Get tooltip dimensions
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const tooltipHeight = tooltipRef.current.offsetHeight;

        // Calculate horizontal position - consistent for both top and bottom positioning
        // Position tooltip starting from the left edge of the bar
        let tooltipX = margin.left;

        // Keep tooltip within horizontal bounds
        if (
          tooltipX + tooltipWidth >
          containerWidth - scrollbarWidth - margin.right
        ) {
          tooltipX =
            containerWidth - tooltipWidth - scrollbarWidth - margin.right;
        }

        // Calculate potential positions
        const tooltipTopPosition =
          groupRect.top - containerRect.top - tooltipHeight - 5;
        const tooltipBottomPosition = groupRect.bottom - containerRect.top + 5;

        // Determine vertical position - above or below bar
        let tooltipY;
        if (tooltipTopPosition - scrollTop >= xAxisHeight) {
          // There's enough space above the bar
          tooltipY = tooltipTopPosition;
        } else {
          // Position below the bar
          tooltipY = tooltipBottomPosition;
        }

        // Apply corrected position
        tooltip
          .style("left", `${tooltipX}px`)
          .style("top", `${tooltipY}px`)
          .style("opacity", 1);

        // Highlight this bar and dim others
        d3.selectAll(".institution-group").style("opacity", 0.3);
        d3.select(this).style("opacity", 1);
        d3.select(this).select(".bar").attr("fill", "#2196f3");
        d3.select(this)
          .select(".institution-label")
          .style("font-weight", "bold");

        // Highlight the count label
        d3.select(this)
          .select(".count-label")
          .attr("fill", "#0d47a1") // Darker blue color
          .attr("font-weight", "bold")
          .attr("font-size", "12px"); // Slightly larger font
      })
      .on("mouseout", function () {
        // Hide tooltip
        tooltip.style("opacity", 0).style("visibility", "hidden");

        // Restore all bars
        d3.selectAll(".institution-group").style("opacity", 1);
        d3.select(this).select(".bar").attr("fill", "#1976d2");
        d3.select(this)
          .select(".institution-label")
          .style("font-weight", "normal");

        // Reset count label styling
        d3.select(this)
          .select(".count-label")
          .attr("fill", "gray")
          .attr("font-weight", "normal")
          .attr("font-size", "11px");
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
        position: "relative", // Important for absolute positioning of tooltip
      }}
    >
      <Typography variant="h5">Top {data.length} Institutions</Typography>

      {/* Fixed header with x-axis */}
      <Box
        sx={{
          height: "50px",
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
