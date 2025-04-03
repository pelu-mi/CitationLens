import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { assignRGBColor } from "../../utils/assignRGBColor";

export const ForceDirectedGraph = ({ works }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const activeNodeRef = useRef(null);
  const activeNodeElementRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Resize observer to update graph dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    // Start observing the container
    resizeObserver.observe(containerRef.current);

    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      !works.length ||
      !svgRef.current ||
      !dimensions.width ||
      !dimensions.height
    )
      return;

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
      title: work.title || "Untitled work",
      year: work.publication_year,
      citations: work.cited_by_count,
      type: work.type,
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

    // Use actual dimensions from state
    const width = dimensions.width;
    const height = dimensions.height;

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "width: 100%; height: 100%;");

    // Create tooltip div
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("pointer-events", "none")
      .style("z-index", "10")
      .style("max-width", "300px")
      .style("opacity", 0)
      .style("transition", "opacity 300ms")
      .style("top", "0")
      .style("left", "0");

    tooltipRef.current = tooltip.node();

    // Add zoom functionality
    const g = svg.append("g");

    // Define zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 8])
      .filter((event) => {
        // Disable double-click zoom behavior
        return !event.type.includes("dblclick");
      })
      .on("zoom", (event) => {
        g.attr("transform", event.transform);

        // Update tooltip position if it's visible and we have an active node
        if (activeNodeRef.current && tooltip.style("opacity") > 0) {
          updateTooltipPosition();
        }
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

    // Add arrow markers for directed edges with different colors
    const defs = svg.append("defs");

    // Default arrow marker
    defs
      .append("marker")
      .attr("id", "arrow-default")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", -1)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    // Outgoing arrow marker (blue)
    defs
      .append("marker")
      .attr("id", "arrow-outgoing")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", -1)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#007bff")
      .attr("d", "M0,-5L10,0L0,5");

    // Incoming arrow marker (green)
    defs
      .append("marker")
      .attr("id", "arrow-incoming")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", -1)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#28a745")
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
      .attr("marker-end", "url(#arrow-default)")
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
      .force("charge", d3.forceManyBody().strength(-20))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Function to find neighbor nodes
    function findNeighbors(nodeId) {
      const neighbors = {
        outgoing: new Set(),
        incoming: new Set(),
        all: new Set(),
      };

      links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;

        if (sourceId === nodeId) {
          neighbors.outgoing.add(targetId);
          neighbors.all.add(targetId);
        } else if (targetId === nodeId) {
          neighbors.incoming.add(sourceId);
          neighbors.all.add(sourceId);
        }
      });

      return neighbors;
    }

    // Function to highlight a node and its connections with different colors for incoming/outgoing
    function highlightConnections(d, opacity = 1) {
      const neighbors = findNeighbors(d.id);

      // Dim all nodes and links
      node.style("opacity", 0.2);
      link.style("opacity", 0.1).attr("marker-end", "url(#arrow-default)");

      // Highlight hovered node and its neighbors
      node
        .filter((n) => n.id === d.id || neighbors.all.has(n.id))
        .style("opacity", opacity);

      // Highlight outgoing links (blue)
      link
        .filter((l) => {
          const sourceId =
            typeof l.source === "object" ? l.source.id : l.source;
          const targetId =
            typeof l.target === "object" ? l.target.id : l.target;
          return sourceId === d.id;
        })
        .style("opacity", opacity)
        .style("stroke", "#007bff")
        .style("stroke-width", 2)
        .attr("marker-end", "url(#arrow-outgoing)");

      // Highlight incoming links (green)
      link
        .filter((l) => {
          const sourceId =
            typeof l.source === "object" ? l.source.id : l.source;
          const targetId =
            typeof l.target === "object" ? l.target.id : l.target;
          return targetId === d.id;
        })
        .style("opacity", opacity)
        .style("stroke", "#28a745")
        .style("stroke-width", 2)
        .attr("marker-end", "url(#arrow-incoming)");
    }

    // Function to reset highlighting
    function resetHighlighting() {
      node.style("opacity", 1);
      link
        .style("opacity", 0.6)
        .style("stroke", "#999")
        .style("stroke-width", 1.5)
        .attr("marker-end", "url(#arrow-default)");
    }

    // Function to update tooltip position based on the active node element
    function updateTooltipPosition() {
      if (!activeNodeElementRef.current) return;

      // Get node position and dimensions
      const nodeElement = activeNodeElementRef.current;
      const nodeRect = nodeElement.getBoundingClientRect();

      // Get the SVG dimensions
      const svgRect = svgRef.current.getBoundingClientRect();

      // Get tooltip dimensions
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipHeight = tooltipRef.current.offsetHeight;

      // Node radius (including zoom effect)
      const circleElement = nodeElement.querySelector("circle");
      const nodeRadius = parseFloat(circleElement.getAttribute("r"));

      // Get current zoom transformation
      const transform = d3.zoomTransform(svg.node());
      const zoomedRadius = nodeRadius * transform.k;

      // Calculate the center of the node relative to the page
      const nodeCenterX = nodeRect.left + nodeRect.width / 2;
      const nodeCenterY = nodeRect.top + nodeRect.height / 2;

      // Available space in each direction from the node center
      const spaceRight = svgRect.right - nodeCenterX - zoomedRadius;
      const spaceLeft = nodeCenterX - svgRect.left - zoomedRadius;
      const spaceBelow = svgRect.bottom - nodeCenterY - zoomedRadius;
      const spaceAbove = nodeCenterY - svgRect.top - zoomedRadius;

      // Determine best position based on available space
      let tooltipX, tooltipY;

      // Horizontal positioning - prefer right if space available
      if (spaceRight >= tooltipWidth + 20) {
        // Position to the right
        tooltipX = nodeCenterX + zoomedRadius + 15;
      } else if (spaceLeft >= tooltipWidth + 20) {
        // Position to the left
        tooltipX = nodeCenterX - zoomedRadius - tooltipWidth - 15;
      } else {
        // Center horizontally if neither side has enough space
        tooltipX = nodeCenterX - tooltipWidth / 2;
      }

      // Vertical positioning - prefer below if space available
      if (spaceBelow >= tooltipHeight - 30) {
        // Position below
        tooltipY = nodeCenterY + zoomedRadius - 25;
      } else if (spaceAbove >= tooltipHeight - 30) {
        // Position above
        tooltipY = nodeCenterY - zoomedRadius - tooltipHeight + 25;
      } else {
        // Center vertically if neither above nor below has enough space
        tooltipY = nodeCenterY - tooltipHeight / 2;
      }

      // Final boundary checks to keep tooltip within SVG area
      tooltipX = Math.max(
        svgRect.left + 10,
        Math.min(tooltipX, svgRect.right - tooltipWidth - 10)
      );
      tooltipY = Math.max(
        svgRect.top + 10,
        Math.min(tooltipY, svgRect.bottom - tooltipHeight - 10)
      );

      // Apply position
      tooltip.style("left", `${tooltipX}px`).style("top", `${tooltipY}px`);
    }

    // Function to show tooltip
    function showTooltip(event, d, nodeElement) {
      // Store active node and its DOM element
      activeNodeRef.current = d;
      activeNodeElementRef.current = nodeElement;

      // Get neighbor counts
      const neighbors = findNeighbors(d.id);

      const [r, g, b] = assignRGBColor(d.type);

      // Update tooltip content with incoming/outgoing counts
      tooltip.html(`
        <strong>${d.title}</strong><br>
        Type: <span style="text-transform: capitalize;">${d.type}</span><br>
        Year: ${d.year || "N/A"}<br>
        References: ${d.referencesCount}<br>
        Citation Count: ${d.citations}<br>
      `);

      // Make tooltip visible first with zero opacity
      tooltip.style("visibility", "visible").style("opacity", 0);

      // Update position
      updateTooltipPosition();

      // Fade in tooltip
      tooltip.style("opacity", 1);

      // Highlight connections
      highlightConnections(d);

      // Prevent event from propagating to SVG (which would close the tooltip)
      event.stopPropagation();
    }

    // Function to hide tooltip
    function hideTooltip() {
      tooltip.style("opacity", 0).on("transitionend", function () {
        if (parseFloat(tooltip.style("opacity")) === 0) {
          tooltip.style("visibility", "hidden");
        }
      });

      // Clear active node references
      activeNodeRef.current = null;
      activeNodeElementRef.current = null;

      // Reset highlighting
      resetHighlighting();
    }

    // Add nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation))
      .attr("data-id", (d) => d.id)
      .attr("class", "node-group")
      .style("position", "relative");

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
      .attr("cursor", "pointer")
      .on("mouseover", (event, d) => {
        // Only highlight on hover, don't show tooltip
        highlightConnections(d);
      })
      .on("mouseout", () => {
        // Only reset highlighting if we don't have an active node
        if (!activeNodeRef.current) {
          resetHighlighting();
        } else {
          // If we have an active node, restore its highlighting
          highlightConnections(activeNodeRef.current);
        }
      })
      .on("click", function (event, d) {
        // If clicking the already active node, hide the tooltip
        if (activeNodeRef.current && activeNodeRef.current.id === d.id) {
          hideTooltip();
        } else {
          // Otherwise show tooltip for this node, passing the node's group element
          showTooltip(event, d, this.parentNode);
        }

        // Stop propagation to prevent the click from reaching the SVG
        event.stopPropagation();
      });

    // Click anywhere else on the SVG to hide tooltip
    svg.on("click", () => {
      if (activeNodeRef.current) {
        hideTooltip();
      }
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

      // Update tooltip position if it's visible
      if (activeNodeRef.current && tooltip.style("opacity") > 0) {
        updateTooltipPosition();
      }
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

        // Update tooltip position if this is the active node
        if (activeNodeRef.current && activeNodeRef.current.id === d.id) {
          updateTooltipPosition();
        }
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

    // Position zoom controls with regard to width
    const zoomControls = svg
      .append("g")
      .attr("transform", `translate(${width - 35}, 20)`)
      .attr("class", "zoom-controls");

    // Zoom in button
    zoomControls
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#fefefe")
      .attr("stroke", "#ccc")
      .attr("rx", 5)
      .attr("cursor", "pointer")
      .on("click", (event) => {
        event.stopPropagation();
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
      .attr("fill", "#fefefe")
      .attr("stroke", "#ccc")
      .attr("rx", 5)
      .attr("cursor", "pointer")
      .on("click", (event) => {
        event.stopPropagation();
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
      .attr("fill", "#fefefe")
      .attr("stroke", "#ccc")
      .attr("rx", 5)
      .attr("cursor", "pointer")
      .on("click", (event) => {
        event.stopPropagation();
        fitView();
      });

    zoomControls
      .append("text")
      .attr("x", 15)
      .attr("y", 100)
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .text("⟲");

    // Add a legend for edge types
    const edgeLegend = svg
      .append("g")
      .attr("transform", `translate(5, ${height - 50})`)
      .attr("class", "edge-legend");

    edgeLegend
      .append("text")
      .attr("x", 0)
      .attr("y", -18)
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text("Connection Types");

    // Outgoing edge
    edgeLegend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 30)
      .attr("y2", 0)
      .attr("stroke", "#007bff")
      .attr("stroke-width", 2);

    edgeLegend
      .append("text")
      .attr("x", 35)
      .attr("y", 4)
      .text("Reference")
      .attr("font-size", "10px");

    // Incoming edge
    edgeLegend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 20)
      .attr("x2", 30)
      .attr("y2", 20)
      .attr("stroke", "#28a745")
      .attr("stroke-width", 2);

    edgeLegend
      .append("text")
      .attr("x", 35)
      .attr("y", 24)
      .text("Citation")
      .attr("font-size", "10px");

    // Add node type color legend
    const typeLegend = svg
      .append("g")
      .attr("transform", `translate(5, 40)`)
      .attr("class", "type-legend");

    // Title for the type legend
    typeLegend
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text("Work Types");

    // Define the document types from assignRGBColor
    const documentTypes = [
      { type: "article", label: "Article" },
      { type: "book", label: "Book / Book Chapter" },
      { type: "dataset", label: "Dataset" },
      { type: "preprint", label: "Preprint" },
      { type: "dissertation", label: "Dissertation" },
      { type: "others", label: "Others" },
    ];

    // Create legend entries for each document type
    documentTypes.forEach((item, i) => {
      const y = i * 20;
      const rgb = assignRGBColor(item.type);

      // Color circle
      typeLegend
        .append("circle")
        .attr("cx", 10)
        .attr("cy", y + 10)
        .attr("r", 8)
        .attr("fill", `rgb(${rgb.join(",")})`)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      // Type label
      typeLegend
        .append("text")
        .attr("x", 25)
        .attr("y", y + 14)
        .attr("font-size", "10px")
        .text(item.label);
    });

    // Automatically resize handling
    window.addEventListener("resize", fitView);

    return () => {
      simulation.stop();
      window.removeEventListener("resize", fitView);
      // Remove tooltip when component unmounts
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
      }
    };
  }, [works, dimensions]);

  return (
    <div
      ref={containerRef}
      className="force-directed-graph-container"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
};
