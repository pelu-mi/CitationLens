import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router";
import { extractId } from "../../utils/extractId";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { createRoot } from "react-dom/client";

export const RadialTree = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
    const lineHeight = 1.25; // ems
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

  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Helper function to create a control button with Material-UI icon
  function createControlButton(svg, g, y, onClick, IconComponent, label) {
    // Create a foreign object to host the React component
    const foreignObject = g
      .append("foreignObject")
      .attr("x", 0)
      .attr("y", y)
      .attr("width", 36)
      .attr("height", 36)
      .attr("cursor", "pointer");

    // Create a div element inside the foreignObject
    const div = document.createElement("div");
    div.style.width = "36px";
    div.style.height = "36px";
    div.style.backgroundColor = "#fefefe";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "5px";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.cursor = "pointer";
    div.title = label;

    // Append the div to the foreignObject
    foreignObject.node().appendChild(div);

    // Create a React root and render the icon
    const root = createRoot(div);
    root.render(<IconComponent style={{ fontSize: "20px", color: "#555" }} />);

    // Add click event listener
    div.addEventListener("click", (event) => {
      event.stopPropagation();
      onClick();
    });

    return foreignObject;
  }

  useEffect(() => {
    if (
      !data ||
      !svgRef.current ||
      dimensions.width === 0 ||
      dimensions.height === 0
    )
      return;

    // Clear any existing SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Dynamic radius calculation based on container size
    const minDimension = Math.min(dimensions.width, dimensions.height);
    const radius = (minDimension / 2) * 0.77; // Use 80% of available space for the tree

    // Center coordinates
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2 - 10;

    // Set up SVG
    svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
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
      .scaleExtent([0.9, 10]) // Allow zooming out slightly more
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
      .attr("stroke-width", 1)
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
        // Scale node size based on viewport size
        const baseSize = minDimension / 1200;
        if (d.depth <= 1) return baseSize * 4; // Root node & First level children
        return baseSize * 3; // Other nodes
      })
      .attr("class", "node");

    // Label group with improved positioning and interaction
    const labelGroup = container.append("g").attr("class", "labels");

    // Scale font size based on viewport
    const fontSizeScale = minDimension / 1200; // Scale factor for font sizes

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
          return d.x < Math.PI ? -6 : 6;
        }
        return d.x < Math.PI === !d.children ? 6 : -6;
      })
      .attr("text-anchor", (d) => {
        return d.x < Math.PI === !d.children ? "start" : "end";
      })
      .attr("paint-order", "stroke")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("font-size", (d) => {
        // Adjust font size based on viewport size
        if (d.depth === 0) return `${Math.max(4, 18 * fontSizeScale)}px`; // Root node
        if (d.depth === 1) return `${Math.max(2, 14 * fontSizeScale)}px`; // First level children
        return `${Math.max(2, 11 * fontSizeScale)}px`; // Other nodes
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
        if (d.data.display_name.length > 14) {
          // Scale the max width based on viewport size
          const baseWidth = minDimension / 25;
          const maxWidth =
            d.depth === 0
              ? baseWidth * 2 // Root node
              : d.depth === 1
              ? baseWidth * 2.6 // First level
              : baseWidth * 4.5; // Other nodes
          wrapText(this, maxWidth);
        }
      })
      .on("mouseenter", (event, hoveredNode) => {
        // Make the hovered label bold
        d3.select(event.currentTarget)
          .transition()
          .duration(50)
          .attr("font-weight", "bold");

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
            .attr("stroke-width", 1.5);
        });
      })
      .on("mouseleave", (event) => {
        // Reset font weight to normal for nodes that aren't root or first level
        d3.select(event.currentTarget)
          .transition()
          .duration(50)
          .attr("font-weight", (d) => (d.depth <= 1 ? "bold" : "normal"));

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
          .attr("stroke-width", 1);

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

    // Calculate appropriate initial zoom level based on tree size
    // and container dimensions
    const initialScale = 0.9; // Slightly smaller to show the whole tree
    const initialZoom = d3.zoomIdentity.translate(cx, cy).scale(initialScale);
    svg.call(zoom.transform, initialZoom);

    // Fit view function to center and show all nodes
    const fitView = () => {
      // Apply the initial zoom transformation to fit the entire visualization
      svg.transition().duration(300).call(zoom.transform, initialZoom);
    };

    // Create zoom controls group at the top right
    const zoomControls = svg
      .append("g")
      .attr("transform", `translate(${dimensions.width - 36}, 14)`)
      .attr("class", "zoom-controls");

    // Add zoom in button
    createControlButton(
      svg,
      zoomControls,
      0,
      () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
      },
      AddIcon,
      "Zoom In"
    );

    // Add zoom out button
    createControlButton(
      svg,
      zoomControls,
      45,
      () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.7);
      },
      RemoveIcon,
      "Zoom Out"
    );

    // Add fit view button
    createControlButton(
      svg,
      zoomControls,
      90,
      fitView,
      CenterFocusStrongIcon,
      "Fit View"
    );
  }, [data, dimensions, navigate]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <svg
        id="radial-tree"
        ref={svgRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
