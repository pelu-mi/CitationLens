import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export const AuthorsScatterplot = ({ authors, width = 600, height = 400 }) => {
  const scatterplotRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    // Clear any existing plot
    if (!authors.length || !scatterplotRef.current) return;
    d3.select(scatterplotRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(scatterplotRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
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
      .attr("x", -plotHeight / 2)
      .attr("y", -50)
      .attr("fill", "black")
      .text("Number of Citations");
    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Dots
    const dots = svg
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
      .on("mouseover", function (event, d) {
        // Highlight current dot
        d3.selectAll(".dot").transition().duration(200).attr("opacity", 0.2);

        d3.select(this).transition().duration(200).attr("opacity", 1);

        // Position tooltip
        const svgNode = scatterplotRef.current.querySelector("svg");
        const svgRect = svgNode.getBoundingClientRect();
        const dotX = xScale(d.works_count);
        const dotY = yScale(d.cited_by_count);

        tooltip.transition().duration(200).style("opacity", 0.9);

        tooltip
          .html(
            `
          <strong>${d.display_name}</strong><br/>
          Works: ${d.works_count}<br/>
          Citations: ${d.cited_by_count}
        `
          )
          .style("left", `${svgRect.left + dotX + 80}px`)
          .style("top", `${svgRect.top + dotY + 20}px`)
          .style("transform", "translateY(-50%)");
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
  }, [authors, width, height]);

  return (
    <>
      <div
        ref={scatterplotRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
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
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          top: 0,
          left: 0,
        }}
      />
    </>
  );
};
