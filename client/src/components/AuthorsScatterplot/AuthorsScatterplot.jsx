/**
 * @component AuthorsScatterplot
 * @description Renders a D3 scatterplot visualization of authors comparing between works count and citations count.
 */

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";

export const AuthorsScatterplot = ({ authors }) => {
  const containerRef = useRef(null);
  const scatterplotRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  /**
   * Set up resize observer to handle container size changes
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    // Initial size calculation
    setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /**
   * Create and update D3 scatterplot based on authors data and container dimensions
   */
  useEffect(() => {
    // Clear any existing plot
    if (!authors.length || !scatterplotRef.current || dimensions.width === 0)
      return;
    d3.select(scatterplotRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const plotWidth = dimensions.width - margin.left - margin.right;
    const plotHeight = dimensions.height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(scatterplotRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .style("position", "relative");

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(authors, (d) => d.works_count)])
      .range([0, plotWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(authors, (d) => d.cited_by_count)])
      .range([plotHeight, 0]);

    // X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", plotWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Number of Works");

    // Y-axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -plotHeight / 2 + 50)
      .attr("y", -60)
      .attr("fill", "black")
      .text("Number of Citations");

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Dots
    svg
      .selectAll(".dot")
      .data(authors)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.works_count))
      .attr("cy", (d) => yScale(d.cited_by_count))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7)
      .attr("position", "relative")
      .on("mouseover", function (event, d) {
        // Highlight current dot
        d3.selectAll(".dot").transition().duration(200).attr("opacity", 0.2);

        d3.select(this).transition().duration(200).attr("opacity", 1);

        // Position tooltip
        const svgNode = scatterplotRef.current.querySelector("svg");
        const svgRect = svgNode.getBoundingClientRect();
        const dotX = xScale(d.works_count);
        const dotY = yScale(d.cited_by_count);

        // Set tooltip content first to measure its width
        tooltip.html(
          `
          <strong>${d.display_name}</strong><br/>
          Works: ${d.works_count.toLocaleString()}<br/>
          Citations: ${d.cited_by_count.toLocaleString()}
        `
        );

        // Measure actual tooltip width
        const tooltipNode = tooltipRef.current;
        const measuredWidth = tooltipNode.offsetWidth;
        const measuredHeight = tooltipNode.offsetHeight;

        // Tooltip positioning logic
        let left, top;

        // Determine horizontal position
        if (dotX + measuredWidth - 50 > plotWidth) {
          // If tooltip would go beyond right edge, position it to the left of the dot
          left = svgRect.left + dotX - measuredWidth + 50;
        } else {
          // Position to the right of the dot
          left = svgRect.left + dotX + 90;
        }

        // Determine vertical position
        if (dotY + measuredHeight > plotHeight) {
          // If tooltip would go below the plot, position it above the dot
          top = svgRect.top + dotY - measuredHeight + 60;
        } else {
          // Position below the dot
          top = svgRect.top + dotY - 2;
        }

        tooltip
          .transition()
          .duration(200)
          .style("left", `${left}px`)
          .style("top", `${top}px`)
          .style("opacity", 1)
          .style("transform", "none");
      })
      .on("mouseout", function () {
        // Restore dot appearance
        d3.selectAll(".dot")
          .transition()
          .duration(200)
          .attr("opacity", 0.7)
          .attr("fill", "steelblue");

        // Hide tooltip
        tooltip.transition().duration(200).style("opacity", 0);
      });
  }, [authors, dimensions]);

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
      <Typography variant="h5">Top {authors.length} Authors</Typography>

      <Box
        ref={scatterplotRef}
        sx={{
          width: "100%",
          flex: 1,
          pl: 2,
          pt: 1,
        }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          backgroundColor: "white",
          border: "1px solid #ddd",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          zIndex: 10,
          maxWidth: "250px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      />
    </Box>
  );
};
