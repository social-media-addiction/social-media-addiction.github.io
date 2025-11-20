import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

export interface LineChartData {
  x: number | string;
  y: number;
}

interface LineChartProps {
  data: LineChartData[];
  xLabel?: string;
  yLabel?: string;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, xLabel = '', yLabel = '', color = '#69b3a2' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Determine if x is numeric or categorical
    const isNumeric = typeof data[0].x === 'number';
    
    let xScale: any;
    if (isNumeric) {
      const xExtent = d3.extent(data, d => d.x as number) as [number, number];
      xScale = d3.scaleLinear()
        .domain(xExtent)
        .range([0, chartWidth]);
    } else {
      xScale = d3.scalePoint()
        .domain(data.map(d => String(d.x)))
        .range([0, chartWidth])
        .padding(0.5);
    }

    const yMax = d3.max(data, d => d.y) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([chartHeight, 0]);

    // X Axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(isNumeric ? d3.axisBottom(xScale) : d3.axisBottom(xScale));
    
    xAxis.selectAll("text")
      .attr("fill", "white")
      .attr("font-size", 11);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "white")
      .attr("font-size", 11);

    // Axis styling
    g.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(255,255,255,0.3)");

    // Line generator
    const line = d3.line<LineChartData>()
      .x(d => isNumeric ? xScale(d.x as number) : xScale(String(d.x))!)
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Draw line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => isNumeric ? xScale(d.x as number) : xScale(String(d.x))!)
      .attr('cy', d => yScale(d.y))
      .attr('r', 4)
      .attr('fill', color)
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 2)
      .on('mouseover', function() {
        d3.select(this).attr('r', 7);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4);
      });

    // Labels
    if (xLabel) {
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 45)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(xLabel);
    }

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(yLabel);
    }

  }, [data, dimensions, color, xLabel, yLabel]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default LineChart;
