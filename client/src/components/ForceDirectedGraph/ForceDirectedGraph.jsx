// ForceDirectedGraph.jsx
import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { assignRGBColor } from "../../utils/assignRGBColo";

export const ForceDirectedGraph = ({ works }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

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
      .attr("marker-end", "url(#arrow)");

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
      .force("charge", d3.forceManyBody().strength(-20)) // Reduced trength to make the graph more compact
      .force("center", d3.forceCenter(0, 0))
      .force("collide", d3.forceCollide().radius(40));

    // Add nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));

    // Node circles
    node
      .append("circle")
      .attr("r", 13)
      .attr("fill", (d) => {
        let rgb = assignRGBColor(d.type);
        return `rgb(${rgb.join(",")})`;
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

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
    };
  }, [works]);

  return (
    <div ref={containerRef} className="force-directed-graph">
      <svg ref={svgRef} />
    </div>
  );
};
