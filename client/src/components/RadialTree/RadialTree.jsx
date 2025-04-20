import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router";
import { extractId } from "../../utils/extractId";

export const RadialTree = ({ data }) => {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  // Color generation function to create distinct colors for branches
  const generateBranchColors = (root) => {
    const colorMap = new Map();

    // Color palette with enough distinct colors
    const baseColors = [
      "#1f77b4", // Blue
      "#ff7f0e", // Orange
      "#2ca02c", // Green
      "#d62728", // Red
      "#9467bd", // Purple
      "#8c564b", // Brown
      "#e377c2", // Pink
      "#7f7f7f", // Gray
      "#bcbd22", // Olive
      "#17becf", // Cyan
      "#8fa9cc", // Light Blue
      "#ffbb78", // Light Orange
      "#98df8a", // Light Green
      "#ff9896", // Light Red
      "#c5b0d5", // Lavender
    ];

    const assignUniqueColors = (node, depth = 0) => {
      // If this is the root, assign the first color
      if (depth === 0) {
        colorMap.set(node, baseColors[0]);
      }

      // If node has children, assign colors to each child branch
      if (node.children) {
        node.children.forEach((child, index) => {
          // Use a color from the palette, cycling through if needed
          const colorIndex = (index + 1) % baseColors.length;
          colorMap.set(child, baseColors[colorIndex]);

          // Recursively assign colors to grandchildren
          if (child.children) {
            child.children.forEach((grandchild) => {
              colorMap.set(grandchild, colorMap.get(child));
            });
          }
        });
      }

      return colorMap;
    };

    return assignUniqueColors(root);
  };

  // Function to wrap text labels
  const wrapText = (textNode, width) => {
    const text = d3.select(textNode);
    const textContent = text.text();
    const words = textContent.split(/\s+/).reverse();
    const lineHeight = 1.4; // ems
    const x = text.attr("x");
    const y = text.attr("y") || 0;
    const dy = parseFloat(text.attr("dy") || 0);

    text.text(null); // Clear existing text

    let line = [];
    let lineNumber = 0;
    let word;
    let tspan = text
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");

    while (words.length > 0) {
      word = words.pop();
      line.push(word);
      tspan.text(line.join(" "));

      // Check if line is too long
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  };

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
      .attr("style", "width: 100%; height: 100%; font: 18px sans-serif;");

    // Create a container group for zooming
    const container = svg.append("g").attr("class", "container");

    // Create a radial cluster layout
    const tree = d3
      .cluster()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    // Sort the tree and apply the layout.
    const root = tree(
      d3
        .hierarchy(data)
        .sort((a, b) => d3.ascending(a.data.display_name, b.data.display_name))
    );

    // Generate branch colors
    const branchColors = generateBranchColors(root);

    // Zoom functionality
    const zoom = d3
      .zoom()
      .scaleExtent([1, 10]) // Limit zoom levels
      .filter((event) => {
        // Disable double-click zoom behavior
        return !event.type.includes("dblclick");
      })
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    // Apply zoom to the SVG
    svg.call(zoom);

    // Create link group
    const linkGroup = container
      .append("g")
      .attr("fill", "none")
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
      .attr("stroke", (d) => branchColors.get(d.target) || "#555")
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
      .attr("fill", (d) => {
        if (d.children) return branchColors.get(d) || "#555";
        return branchColors.get(d) || "#999";
      })
      .attr("r", (d) => {
        // Increase size for root and first level nodes
        if (d.depth <= 1) return 6; // Root node & First level children
        return 3; // Other nodes
      })
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
        // Adjust position based on depth for better spacing
        if (d.depth === 0) {
          return d.x < Math.PI ? -12 : 12;
        }
        return d.x < Math.PI === !d.children ? 12 : -12;
      })
      .attr("text-anchor", (d) => {
        return d.x < Math.PI === !d.children ? "start" : "end";
      })
      .attr("paint-order", "stroke")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("font-size", (d) => {
        // Increase font size based on node depth
        if (d.depth === 0) return "28px"; // Root node
        if (d.depth === 1) return "24px"; // First level children
        return "20px"; // Other nodes
      })
      .attr("font-weight", (d) => {
        // Make root and first level labels bold
        return d.depth <= 1 ? "bold" : "normal";
      })
      .attr("fill", "currentColor")
      .style("cursor", (d) => (!d.children ? "pointer" : "default"))
      .attr("class", "label")
      .text((d) => d.data.display_name)
      .each(function (d) {
        // Only wrap text for nodes with longer labels and non-leaf nodes
        if (d.data.display_name.length > 15) {
          const maxWidth =
            d.depth === 0
              ? 240 // Root node
              : d.depth === 1
              ? 230 // First level
              : 550; // Other nodes
          wrapText(this, maxWidth);
        }
      })
      .on("mouseenter", (event, hoveredNode) => {
        // Reset any previous hover state before applying new highlighting
        container
          .selectAll(".node, .link, .label")
          .transition()
          .duration(0)
          .style("opacity", 1);

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
          const nodeColor = branchColors.get(node) || "#3851DD";

          // Highlight nodes
          nodes
            .filter((d) => d === node)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .attr("fill", nodeColor);

          // Highlight labels
          labels
            .filter((d) => d === node)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .attr("fill", nodeColor);

          // Highlight links to this node
          links
            .filter((d) => d.target === node)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .attr("stroke", nodeColor)
            .attr("stroke-width", 3);
        });
      })
      .on("mouseleave", () => {
        // Restore all elements to original state
        nodes
          .transition()
          .duration(0)
          .style("opacity", 1)
          .attr("fill", (d) => {
            if (d.children) return branchColors.get(d) || "#555";
            return branchColors.get(d) || "#999";
          });

        links
          .transition()
          .duration(0)
          .style("opacity", 1)
          .attr("stroke", (d) => branchColors.get(d.target) || "#555")
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
          let subfieldId = extractId(d.data.id);
          let subfieldName = d.data.display_name;
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
