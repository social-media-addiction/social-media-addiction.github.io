// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";
// import { loadStudentData, generateInsights, StudentRecord, Insights } from "../data/data";

// const AnalyzeDataD3Tooltip: React.FC = () => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const tooltipRef = useRef<HTMLDivElement>(null);
//   const svgRef = useRef<SVGSVGElement>(null);

//   useEffect(() => {
//     loadStudentData("/VI/data/dataset.csv").then((data: StudentRecord[]) => {
//       const insights: Insights = generateInsights(data);

//       const width = 700;
//       const height = 450;
//       const margin = { top: 40, right: 30, bottom: 60, left: 70 };

//       // Clear any previous SVG content
//       d3.select(svgRef.current).selectAll("*").remove();

//       const svg = d3.select(svgRef.current)
//         .attr("width", width)
//         .attr("height", height);

//       const xScale = d3.scaleLinear()
//         .domain(d3.extent(insights.sleepVsAddiction, d => d.sleep) as [number, number])
//         .range([margin.left, width - margin.right]);

//       const yScale = d3.scaleLinear()
//         .domain(d3.extent(insights.sleepVsAddiction, d => d.addiction) as [number, number])
//         .range([height - margin.bottom, margin.top]);

//       // Add axes
//       svg.append("g")
//         .attr("transform", `translate(0, ${height - margin.bottom})`)
//         .call(d3.axisBottom(xScale).ticks(5));

//       svg.append("g")
//         .attr("transform", `translate(${margin.left}, 0)`)
//         .call(d3.axisLeft(yScale).ticks(5));

//       // Add points
//       svg.selectAll("circle")
//         .data(insights.sleepVsAddiction)
//         .join("circle")
//         .attr("cx", d => xScale(d.sleep))
//         .attr("cy", d => yScale(d.addiction))
//         .attr("r", 6)
//         .attr("fill", "#6366f1")
//         .attr("opacity", 0.8)
//         .on("mouseover", (event, d) => {
//           if (!tooltipRef.current) return;
//           tooltipRef.current.style.visibility = "visible";
//           tooltipRef.current.textContent = `Sleep: ${d.sleep}, Addiction: ${d.addiction}`;
//         })
//         .on("mousemove", (event) => {
//           if (!tooltipRef.current || !containerRef.current) return;
//           const rect = containerRef.current.getBoundingClientRect();
//           tooltipRef.current.style.left = event.clientX - rect.left + 10 + "px";
//           tooltipRef.current.style.top = event.clientY - rect.top - 30 + "px";
//         })
//         .on("mouseout", () => {
//           if (!tooltipRef.current) return;
//           tooltipRef.current.style.visibility = "hidden";
//         });
//     });
//   }, []);

//   return (
//     <div ref={containerRef} className="relative w-full p-6 bg-white border rounded-lg shadow">
//       <h2 className="text-xl font-semibold mb-4">😴 Sleep vs Addiction (D3 HTML Tooltip)</h2>
//       <svg ref={svgRef}></svg>

//       {/* Tooltip */}
//       <div
//         ref={tooltipRef}
//         className="absolute bg-white border px-2 py-1 text-sm rounded shadow whitespace-nowrap pointer-events-none"
//         style={{ visibility: "hidden", zIndex: 10 }}
//       ></div>
//     </div>
//   );
// };

// export default AnalyzeDataD3Tooltip;
