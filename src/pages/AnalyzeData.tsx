import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { loadStudentData, generateInsights, StudentRecord, Insights } from "../data/data";
import Aurora from "../components/Aurora"; // <-- 1. Import Aurora

const AnalyzeData: React.FC = () => {
  const [data, setData] = useState<StudentRecord[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);

  // Hover tooltip state
  const [hovered, setHovered] = useState<{x: number; y: number; text: string} | null>(null);
  // Brushed points indices
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    loadStudentData("/data/dataset.csv").then((parsed: StudentRecord[]) => {
      setData(parsed);
      setInsights(generateInsights(parsed));
    });
  }, []);

  // --- 2. Define colors for dark mode ---
  const lightGray = "#9ca3af"; // text-gray-400
  const axisLineColor = "#4b5563"; // text-gray-600

  // --- 3. Update renderAxis for dark mode ---
  const renderAxis = (xScale: any, yScale: any, xLabel: string, yLabel: string, xType: 'band' | 'linear' = 'linear') => {
    const xAxis = xType === 'band' 
      ? d3.axisBottom(xScale)
      : d3.axisBottom(xScale).ticks(5);
    
    const yAxis = d3.axisLeft(yScale).ticks(5);

    return (
      <>
        {/* X Axis */}
        <g
          transform={`translate(0, ${height - margin.bottom})`}
          ref={node => { 
            if (node) {
              d3.select(node)
                .call(xAxis as any)
                .selectAll("text")
                .attr("fill", lightGray) // Style axis text
                .attr("font-size", 12);
              d3.select(node)
                .selectAll("line, path")
                .attr("stroke", axisLineColor); // Style axis lines
            }
          }}
        />
        {/* Y Axis */}
        <g
          transform={`translate(${margin.left}, 0)`}
          ref={node => { 
            if (node) {
              d3.select(node)
                .call(yAxis as any)
                .selectAll("text")
                .attr("fill", lightGray) // Style axis text
                .attr("font-size", 12);
              d3.select(node)
                .selectAll("line, path")
                .attr("stroke", axisLineColor); // Style axis lines
            }
          }}
        />
        {/* Labels */}
        <text x={width / 2} y={height - 15} textAnchor="middle" fontSize={13} fill={lightGray} fontWeight="500">
          {xLabel}
        </text>
        <text transform={`rotate(-90) translate(-${height / 2}, 20)`} textAnchor="middle" fontSize={13} fill={lightGray} fontWeight="500">
          {yLabel}
        </text>
      </>
    );
  };


  if (!data.length || !insights) {
    // --- 4. Update loading state for dark mode ---
    return (
      <div className="relative min-h-screen pt-20 text-white bg-gradient-to-b from-[#1a0d26] via-[#2a1a3a] to-[#1a0d26]">
        <p className="p-6 text-gray-300">Loading insights...</p>
      </div>
    );
  }

  const width = 700;
  const height = 450;
  const margin = { top: 40, right: 30, bottom: 60, left: 70 };

  // Scales for Sleep vs Addiction (no changes needed)
  const sleepXScale = d3.scaleLinear()
    .domain(d3.extent(insights.sleepVsAddiction.map(d => d.sleep)) as [number, number])
    .range([margin.left, width - margin.right]);

  const sleepYScale = d3.scaleLinear()
    .domain(d3.extent(insights.sleepVsAddiction.map(d => d.addiction)) as [number, number])
    .range([height - margin.bottom, margin.top]);

  return (
    // --- 5. Add Main BG and Aurora ---
    <div className="relative min-h-screen pt-20 text-white bg-gradient-to-b from-[#1a0d26] via-[#2a1a3a] to-[#1a0d26] overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora
          blend={1.0}
          amplitude={1.2}
          speed={2}
        />
      </div>

      {/* --- 6. Add z-10 Content Wrapper --- */}
      <div className="relative z-10 container mx-auto px-4 py-8">

        {/* --- 7. Restyle Chart Card --- */}
        <div className="bg-[#3b254f]/60 border border-gray-700 shadow-lg rounded-lg p-6 relative">
          <h3 className="text-xl font-semibold mb-4 text-teal-300">Sleep vs Addiction</h3>

          <svg width={width} height={height} className="mx-auto">
            {/* Brushing Layer (no style change needed, default looks good) */}
            <g
              ref={node => {
                if (!node) return;
                const brush = d3.brush()
                  .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
                  .on("brush end", (event) => {
                    if (event.selection) {
                      const [[x0, y0], [x1, y1]] = event.selection;
                      const selected = insights.sleepVsAddiction
                        .map((_, i) => i)
                        .filter(i => {
                          const cx = sleepXScale(insights.sleepVsAddiction[i].sleep);
                          const cy = sleepYScale(insights.sleepVsAddiction[i].addiction);
                          return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
                        });
                      setSelectedIndices(selected);
                    } else {
                      setSelectedIndices([]);
                    }
                  });
                d3.select(node).call(brush as any);
              }}
            />

            {/* Points (colors are vibrant, no change needed) */}
            {insights.sleepVsAddiction.map((d, i) => (
              <circle
                key={i}
                cx={sleepXScale(d.sleep)}
                cy={sleepYScale(d.addiction)}
                r={6}
                fill={selectedIndices.includes(i) ? "#f59e0b" : "#6366f1"} // Orange if selected, Indigo if not
                opacity={0.8}
                className="transition-opacity"
                onMouseEnter={(e) => {
                  const container = e.currentTarget.closest(".relative") as HTMLElement;
                  if (!container) return;
                  const rect = container.getBoundingClientRect();
                  setHovered({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    text: `Sleep: ${d.sleep}, Addiction: ${d.addiction}`
                  });
                }}
                onMouseMove={(e) => {
                  const container = e.currentTarget.closest(".relative") as HTMLElement;
                  if (!container) return;
                  const rect = container.getBoundingClientRect();
                  setHovered({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    text: `Sleep: ${d.sleep}, Addiction: ${d.addiction}`
                  });
                }}
                onMouseLeave={() => setHovered(null)}
              />
            ))}

            {renderAxis(sleepXScale, sleepYScale, "Sleep Hours/Night", "Addiction Score")}
            
            {/* --- 8. Style SVG text --- */}
            <text
              x={width - margin.right}
              y={margin.top}
              textAnchor="end"
              fontSize={13}
              fill={lightGray} // <-- Updated fill
              fontWeight="500"
            >
              Correlation Analysis
            </text>
          </svg>

          {/* --- 9. Style HTML Tooltip --- */}
          {hovered && (
            <div
              className="absolute bg-gray-900 border border-gray-600 text-white px-2 py-1 text-sm rounded shadow whitespace-nowrap pointer-events-none"
              style={{
                left: hovered.x + 10,
                top: hovered.y - 30,
                zIndex: 10,
              }}
            >
              {hovered.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeData;