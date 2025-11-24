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
  // --- New Optional Domain Parameters ---
  xDomain?: [number, number] | string[]; // For numeric: [min, max], For categorical: ['cat1', 'cat2', ...]
  yDomain?: [number, number];          // Always [min, max] for the y-axis (numeric)
}

const LineChart: React.FC<LineChartProps> = ({ 
    data, 
    xLabel = '', 
    yLabel = '', 
    color = '#69b3a2', 
    // Destructure new props
    xDomain, 
    yDomain 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    // ... (unchanged dimension logic) ...
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

    const isNumeric = typeof data[0].x === 'number';

    let xScale: any;

    // --- X-Scale Domain Logic ---
    if (isNumeric) {
      // Numeric X-Axis (Linear Scale)
      const defaultXExtent = d3.extent(data, d => d.x as number) as [number, number];
      
      const finalXDomain = xDomain && xDomain.length === 2 && typeof xDomain[0] === 'number'
        ? (xDomain as [number, number]) // Use provided domain
        : defaultXExtent;                 // Use calculated domain
        
      xScale = d3.scaleLinear()
        .domain(finalXDomain)
        .range([0, chartWidth]);
    } else {
      // Categorical X-Axis (Point Scale)
      const defaultXCategories = data.map(d => String(d.x));

      const finalXDomain = xDomain && xDomain.every(d => typeof d === 'string')
        ? (xDomain as string[]) // Use provided domain
        : defaultXCategories;     // Use calculated domain

      xScale = d3.scalePoint()
        .domain(finalXDomain)
        .range([0, chartWidth])
        .padding(0.5);
    }
    
    // --- Y-Scale Domain Logic ---
    const defaultYMax = d3.max(data, d => d.y) || 0;
    
    // Check if yDomain is provided and valid ([min, max])
    const finalYDomain: [number, number] = yDomain && yDomain.length === 2
      ? yDomain                                   // Use provided domain
      : [0, defaultYMax * 1.1];                   // Use calculated domain (starting from 0)
      
    const yScale = d3.scaleLinear()
      .domain(finalYDomain)
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

    g.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(255,255,255,0.3)");

    // X Axis Label
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', 12)
      .attr('font-weight', '500')
      .text(xLabel);

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', 12)
      .attr('font-weight', '500')
      .text(yLabel);

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
      .attr('opacity', 0.8)
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
      .style('cursor', 'pointer')
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 7);
        
        // Show tooltip
        const dotX = isNumeric ? xScale(d.x as number) : xScale(String(d.x))!;
        const dotY = yScale(d.y) - 15;
        
        g.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${dotX},${dotY})`);
        
        const tooltip = g.select('.tooltip');
        
        // Background
        tooltip.append('rect')
          .attr('x', -30)
          .attr('y', -30)
          .attr('width', 60)
          .attr('height', 35)
          .attr('rx', 5)
          .attr('fill', 'rgba(31, 41, 55, 0.95)')
          .attr('stroke', '#69b3a2')
          .attr('stroke-width', 2);
        
        // Y value
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -5)
          .attr('fill', '#69b3a2')
          .attr('font-size', 14)
          .attr('font-weight', 'bold')
          .text(d.y.toFixed(1));
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4);
        
        // Remove tooltip
        g.selectAll('.tooltip').remove();
      });

    // Update or create X axis label
    const xLabelG = g.selectAll<SVGTextElement, unknown>('.x-label').data([null]);
    xLabelG.enter().append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', 12)
      .attr('font-weight', '500')
      .merge(xLabelG)
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 45)
      .text(xLabel);

    // Update or create Y axis label
    const yLabelG = g.selectAll<SVGTextElement, unknown>('.y-label').data([null]);
    yLabelG.enter().append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', 12)
      .attr('font-weight', '500')
      .merge(yLabelG)
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .text(yLabel);

  }, [data, dimensions, color, xLabel, yLabel, xDomain, yDomain]); // DEPENDENCY ARRAY UPDATED

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default LineChart;