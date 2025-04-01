// ForceDirectedGraph.jsx
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { assignRGBColor } from "../../utils/assignRGBColo";

export const ForceDirectedGraph = ({ works }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!works.length || !svgRef.current) return;

    // Clear any previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create a lookup map for quick access to work objects by ID
    const worksMap = new Map();
    works.forEach((work) => {
      worksMap.set(work.id, work);
    });

    // Create nodes and links for the graph
    const nodes = works.map((work) => ({
      id: work.id,
      title: work.title || "Untitled work", // Provide default for missing titles
      year: work.publication_year,
      citations: work.cited_by_count,
      type: work.type, // Use work type for node coloring
      referencesCount: work.referenced_works ? work.referenced_works.length : 0,
    }));

    // Create links only for referenced works that exist in our 200 fetched works
    const links = [];
    works.forEach((work) => {
      if (work.referenced_works) {
        work.referenced_works.forEach((referencedId) => {
          if (worksMap.has(referencedId) && referencedId !== work.id) {
            links.push({
              source: work.id,
              target: referencedId,
              type: "reference",
            });
          }
        });
      }
    });

    // Set up dimensions
    const width = 928;
    const height = 450;

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

    // Create tooltip div
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "10px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("pointer-events", "none")
      .style("z-index", "10")
      .style("max-width", "250px");

    tooltipRef.current = tooltip.node();

    // Add zoom functionality
    const g = svg.append("g");

    // Define zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 8]) // Allow zooming out further
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Apply zoom to the SVG
    svg.call(zoom);

    function linkArc(d) {
      const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
      return `
        M${d.source.x},${d.source.y}
        A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
      `;
    }

    // Add arrow markers for directed edges
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    // Add links with curved paths
    const link = g
      .append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
      .attr("marker-end", "url(#arrow)")
      .attr("data-source", (d) => d.source.id || d.source)
      .attr("data-target", (d) => d.target.id || d.target);

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-20)) // Reduced strength to make the graph more compact
      .force("center", d3.forceCenter(width / 2, height / 2)) // Center the graph in the SVG
      .force("collide", d3.forceCollide().radius(40));

    // Add nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation))
      .attr("data-id", (d) => d.id);

    // Node circles
    node
      .append("circle")
      .attr("r", 13)
      .attr("fill", (d) => {
        let rgb = assignRGBColor(d.type);
        return `rgb(${rgb.join(",")})`;
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("mouseover", (event, d) => {
        // Show tooltip
        tooltip.style("visibility", "visible").html(`
            <strong>${d.title}</strong><br>
            Year: ${d.year || "N/A"}<br>
            Citations: ${d.citations}<br>
            References: ${d.referencesCount}<br>
            Type: ${d.type}
          `);

        // Calculate tooltip position to stay within viewport
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const svgRect = svgRef.current.getBoundingClientRect();
        const transform = d3.zoomTransform(svg.node());

        // Get transformed node position
        const nodeX = transform.x + d.x * transform.k;
        const nodeY = transform.y + d.y * transform.k;

        // Calculate positioning relative to the SVG container
        let tooltipX = nodeX + svgRect.left + 60; // to the right
        let tooltipY = nodeY + svgRect.top - 10; // to above

        // Adjust if tooltip would go beyond right edge of screen
        if (tooltipX + tooltipWidth + 150 > window.innerWidth) {
          tooltipX = nodeX + svgRect.left - tooltipWidth + 20; // Position to the left of node
        }

        // Adjust if tooltip would go beyond bottom edge of screen
        if (tooltipY + tooltipHeight > window.innerHeight) {
          tooltipY = window.innerHeight - tooltipHeight - 10;
        }

        // Adjust if tooltip would go beyond top edge of screen
        if (tooltipY < 0) {
          tooltipY = 10;
        }

        tooltip
          .transition()
          .duration(300)
          .style("opacity", 1)
          .style("left", `${tooltipX}px`)
          .style("top", `${tooltipY}px`);

        // Find neighbor nodes (connected nodes)
        const neighbors = new Set();
        links.forEach((link) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;

          if (sourceId === d.id) {
            neighbors.add(targetId);
          } else if (targetId === d.id) {
            neighbors.add(sourceId);
          }
        });

        // Dim all nodes and links
        node.style("opacity", 0.2);
        link.style("opacity", 0.1);

        // Highlight hovered node and its neighbors
        node
          .filter((n) => n.id === d.id || neighbors.has(n.id))
          .style("opacity", 1);

        // Highlight connected links
        link
          .filter((l) => {
            const sourceId =
              typeof l.source === "object" ? l.source.id : l.source;
            const targetId =
              typeof l.target === "object" ? l.target.id : l.target;
            return sourceId === d.id || targetId === d.id;
          })
          .style("opacity", 1)
          .style("stroke", "#007bff")
          .style("stroke-width", 2);
      })
      .on("mouseout", () => {
        // Hide tooltip
        tooltip.transition().duration(300).style("opacity", 0);

        // Reset all nodes and links to original appearance
        node.style("opacity", 1);
        link
          .style("opacity", 0.6)
          .style("stroke", "#999")
          .style("stroke-width", 1.5);
      });

    // Fit view function to calculate appropriate zoom level
    const fitView = () => {
      // Let the simulation run for a bit to position nodes
      for (let i = 0; i < 120; ++i) simulation.tick();

      // Get bounds of all nodes
      let minX = Infinity,
        minY = Infinity;
      let maxX = -Infinity,
        maxY = -Infinity;

      nodes.forEach((node) => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x);
        maxY = Math.max(maxY, node.y);
      });

      // Add padding
      const padding = 50;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;

      // Calculate the scale and translate parameters
      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      const scale = Math.min(width / graphWidth, height / graphHeight) * 0.9; // Add some margin

      const translateX = width / 2 - (scale * (minX + maxX)) / 2;
      const translateY = height / 2 - (scale * (minY + maxY)) / 2;

      // Apply the transformation
      svg
        .transition()
        .duration(200)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
    };

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    fitView();

    // Drag functionality
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Add zoom controls
    const zoomControls = svg
      .append("g")
      .attr("transform", `translate(${width - 80}, 30)`)
      .attr("class", "zoom-controls");

    // Zoom in button
    zoomControls
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#999")
      .attr("rx", 5)
      .attr("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
      });

    zoomControls
      .append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .text("+");

    // Zoom out button
    zoomControls
      .append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#999")
      .attr("rx", 5)
      .attr("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.7);
      });

    zoomControls
      .append("text")
      .attr("x", 15)
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .text("−");

    // Reset/Fit view button
    zoomControls
      .append("rect")
      .attr("x", 0)
      .attr("y", 80)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#999")
      .attr("rx", 5)
      .attr("cursor", "pointer")
      .on("click", fitView);

    zoomControls
      .append("text")
      .attr("x", 15)
      .attr("y", 100)
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .text("⟲");

    return () => {
      simulation.stop();
      // Remove tooltip when component unmounts
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
      }
    };
  }, [works]);

  return (
    <div ref={containerRef} className="force-directed-graph">
      <svg ref={svgRef} style={{ position: "relative" }} />
    </div>
  );
};
