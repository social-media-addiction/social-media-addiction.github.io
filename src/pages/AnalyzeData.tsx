import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { loadStudentData, generateInsights, StudentRecord, Insights } from "../data/data";

const AnalyzeData: React.FC = () => {
  const [data, setData] = useState<StudentRecord[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);

  // Hover tooltip state
  const [hovered, setHovered] = useState<{x: number; y: number; text: string} | null>(null);
  // Brushed points indices
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    loadStudentData("/VI/data/dataset.csv").then((parsed: StudentRecord[]) => {
      setData(parsed);
      setInsights(generateInsights(parsed));
    });
  }, []);

  if (!data.length || !insights) {
    return <p className="p-6 text-gray-500">Loading insights...</p>;
  }

  const width = 700;
  const height = 450;
  const margin = { top: 40, right: 30, bottom: 60, left: 70 };

  const renderAxis = (xScale: any, yScale: any, xLabel: string, yLabel: string, xType: 'band' | 'linear' = 'linear') => {
    const xAxis = xType === 'band' 
      ? d3.axisBottom(xScale)
      : d3.axisBottom(xScale).ticks(5);
    
    const yAxis = d3.axisLeft(yScale).ticks(5);

    return (
      <>
        <g
          transform={`translate(0, ${height - margin.bottom})`}
          ref={node => { if (node) d3.select(node).call(xAxis as any); }}
          fontSize={12}
        />
        <g
          transform={`translate(${margin.left}, 0)`}
          ref={node => { if (node) d3.select(node).call(yAxis as any); }}
          fontSize={12}
        />
        <text x={width / 2} y={height - 15} textAnchor="middle" fontSize={13} fill="#666" fontWeight="500">
          {xLabel}
        </text>
        <text transform={`rotate(-90) translate(-${height / 2}, 20)`} textAnchor="middle" fontSize={13} fill="#666" fontWeight="500">
          {yLabel}
        </text>
      </>
    );
  };

  // Scales for Sleep vs Addiction
  const sleepXScale = d3.scaleLinear()
    .domain(d3.extent(insights.sleepVsAddiction.map(d => d.sleep)) as [number, number])
    .range([margin.left, width - margin.right]);

  const sleepYScale = d3.scaleLinear()
    .domain(d3.extent(insights.sleepVsAddiction.map(d => d.addiction)) as [number, number])
    .range([height - margin.bottom, margin.top]);

  return (
    <div className="relative container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">📊 Social Media Usage Analysis</h1>

      {/* Scatter Plot: Sleep vs Addiction with Brushing */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative">
        <h3 className="text-xl font-semibold mb-4 text-indigo-600">Sleep vs Addiction</h3>


        <svg width={width} height={height} className="mx-auto">
          {/* Brushing Layer */}
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

          {/* Points */}
          {insights.sleepVsAddiction.map((d, i) => (
            <circle
              key={i}
              cx={sleepXScale(d.sleep)}
              cy={sleepYScale(d.addiction)}
              r={6}
              fill={selectedIndices.includes(i) ? "#f59e0b" : "#6366f1"}
              opacity={0.8}
              className="transition-opacity"
              onMouseEnter={(e) => {
                // Get container relative position
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
          <text
            x={width - margin.right}
            y={margin.top}
            textAnchor="end"
            fontSize={13}
            fill="#666"
            fontWeight="500"
          >
            Correlation Analysis
          </text>
        </svg>

        {/* HTML Tooltip */}
        {hovered && (
          <div
            className="absolute bg-white border px-2 py-1 text-sm rounded shadow whitespace-nowrap pointer-events-none"
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
  );
};

export default AnalyzeData;

