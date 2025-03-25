import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router";

export const RadialTree = ({ data }) => {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear any existing SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Specify the chart's dimensions.
    const width = 2400;
    const height = width;
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) / 2 - 360;

    // Set up SVG
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: 100%; height: 80vh; font: 16px sans-serif;");

    // Create a container group for zooming
    const container = svg.append("g").attr("class", "container");

    // Create a radial cluster layout
    const tree = d3
      .cluster()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    // Sort the tree and apply the layout.
    const root = tree(
      d3.hierarchy(data).sort((a, b) => d3.ascending(a.data.name, b.data.name))
    );

    // Zoom functionality
    const zoom = d3
      .zoom()
      .scaleExtent([1, 10]) // Limit zoom levels
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    // Apply zoom to the SVG
    svg.call(zoom);

    // Create link group
    const linkGroup = container
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .attr("class", "links");

    // Append links
    const links = linkGroup
      .selectAll()
      .data(root.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkRadial()
          .angle((d) => d.x)
          .radius((d) => d.y)
      )
      .attr("class", "link");

    // Append nodes group
    const nodeGroup = container.append("g").attr("class", "nodes");

    // Append nodes
    const nodes = nodeGroup
      .selectAll()
      .data(root.descendants())
      .join("circle")
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      )
      .attr("fill", (d) => (d.children ? "#555" : "#999"))
      .attr("r", 2.5)
      .attr("class", "node");

    // Label group with improved positioning and interaction
    const labelGroup = container.append("g").attr("class", "labels");

    const labels = labelGroup
      .selectAll()
      .data(root.descendants())
      .join("text")
      .attr("transform", (d) => {
        const rotate = (d.x * 180) / Math.PI - 90;
        const translateX = d.y;
        const textRotate = d.x >= Math.PI ? 180 : 0;
        return `rotate(${rotate}) translate(${translateX},0) rotate(${textRotate})`;
      })
      .attr("dy", "0.31em")
      .attr("x", (d) => {
        return d.x < Math.PI === !d.children ? 10 : -10;
      })
      .attr("text-anchor", (d) => {
        return d.x < Math.PI === !d.children ? "start" : "end";
      })
      .attr("paint-order", "stroke")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("fill", "currentColor")
      .style("cursor", (d) => (!d.children ? "pointer" : "default"))
      .text((d) => d.data.name)
      .attr("class", "label")
      .on("mouseenter", (event, hoveredNode) => {
        // Find path to root (domain) and children
        const nodePath = [];
        const nodeChildren = [];
        let currentNode = hoveredNode;

        // Collect parent path
        while (currentNode) {
          nodePath.push(currentNode);
          currentNode = currentNode.parent;
        }

        // Collect children
        if (hoveredNode.children) {
          const collectChildren = (node) => {
            nodeChildren.push(node);
            if (node.children) {
              node.children.forEach(collectChildren);
            }
          };
          hoveredNode.children.forEach(collectChildren);
        }

        // Combine paths
        const highlightNodes = [...new Set([...nodePath, ...nodeChildren])];

        // Dim all elements
        container
          .selectAll(".node, .link, .label")
          .transition()
          .duration(200)
          .style("opacity", 0.2);

        // Highlight selected nodes and their path
        highlightNodes.forEach((node) => {
          // Highlight nodes
          nodes
            .filter((d) => d === node)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .attr("fill", "#3851DD");

          // Highlight labels
          labels
            .filter((d) => d === node)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .attr("fill", "#3851DD");

          // Highlight links to this node
          links
            .filter((d) => d.target === node)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .attr("stroke", "#3851DD")
            .attr("stroke-width", 3);
        });

        // Restore hovered node
        nodes
          .filter((d) => d === hoveredNode)
          .transition()
          .duration(200)
          .attr("fill", "#3851DD");

        labels
          .filter((d) => d === hoveredNode)
          .transition()
          .duration(200)
          .attr("fill", "#3851DD");
      })
      .on("mouseleave", () => {
        // Restore all elements to original state
        nodes
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("fill", (d) => (d.children ? "#555" : "#999"));

        links
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("stroke", "#555")
          .attr("stroke-width", 1.5);

        labels
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("fill", "currentColor");
      })
      .on("click", (event, d) => {
        // Only navigate for leaf nodes
        if (!d.children && d.data.id) {
          let subfieldId = d.data.id.replace(
            "https://openalex.org/subfields/",
            ""
          );
          let subfieldName = d.data.name;
          navigate(`/influential/${subfieldId}`, {
            state: { subfieldName },
          });
        }
      });

    // Center the container and apply initial zoom
    container.attr("transform", `translate(${cx},${cy})`);
    const initialZoom = d3.zoomIdentity.translate(cx, cy).scale(1);
    svg.call(zoom.transform, initialZoom);
  }, [data]);

  return (
    <svg
      id="redial-tree"
      ref={svgRef}
      style={{ maxWidth: "100%", height: "auto", cursor: "move" }}
    />
  );
};
