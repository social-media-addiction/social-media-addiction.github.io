import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

export interface ScatterData {
  x: number;
  y: number;
  label?: string;
}

interface ScatterGraphProps {
  data: ScatterData[];
  xLabel?: string;
  yLabel?: string;
  color?: string;
}

const ScatterGraph: React.FC<ScatterGraphProps> = ({ data, xLabel = 'X Axis', yLabel = 'Y Axis', color = '#8b5cf6' }) => {
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

  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || data.length < 2) return;

    // --- 1. Prepare Data and Calculate Correlation ---
    const xMean = d3.mean(data, d => d.x) || 0;
    const yMean = d3.mean(data, d => d.y) || 0;
    const xDev = d3.deviation(data, d => d.x) || 0;
    const yDev = d3.deviation(data, d => d.y) || 0;

    // Calculate Covariance
    const n = data.length;
    const covariance = d3.sum(data, d => (d.x - xMean) * (d.y - yMean)) / (n - 1);

    const correlationValue = (xDev === 0 || yDev === 0) ? 0 : covariance / (xDev * yDev);


    const rText = `r = ${correlationValue.toFixed(3)}`; // Format for display
    
    const svg = d3.select(svgRef.current);
    
    // Only create the main group once
    let g = svg.select<SVGGElement>('g.main-group');
    if (g.empty()) {
      g = svg.append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    }
    // ... (X and Y scale definitions) ...
    const xMax = d3.max(data, d => d.x) || 0;
    const yMax = d3.max(data, d => d.y) || 0;

    const xScale = d3.scaleLinear()
      .domain([0, xMax * 1.1])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([chartHeight, 0]);

    // Update or create axes
    const xAxisG = g.selectAll<SVGGElement, unknown>('.x-axis').data([null]);
    const xAxisEnter = xAxisG.enter().append('g').attr('class', 'x-axis');
    xAxisG.merge(xAxisEnter)
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "white")
      .attr("font-size", 11);

    const yAxisG = g.selectAll<SVGGElement, unknown>('.y-axis').data([null]);
    const yAxisEnter = yAxisG.enter().append('g').attr('class', 'y-axis');
    yAxisG.merge(yAxisEnter)
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "white")
      .attr("font-size", 11);

    // Axis styling
    g.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(255,255,255,0.3)");

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

    // --- 2. Display Correlation Value ---
    const corrTextG = g.selectAll<SVGTextElement, unknown>('.correlation-text').data([null]);
    corrTextG.enter().append('text')
      .attr('class', 'correlation-text')
      .attr('text-anchor', 'end')
      .attr('fill', '#69b3a2')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .merge(corrTextG)
      .attr('x', chartWidth) // Position on the right side of the chart area
      .attr('y', -5)        // Position near the top right of the chart area
      .text(rText);

    // ... (Dots and Tooltip logic - unchanged) ...
    // Dots with animations
    const dots = g.selectAll<SVGCircleElement, ScatterData>('.dot')
      .data(data, (_d, i) => i.toString());

    // Exit animation
    dots.exit()
      .transition()
      .duration(300)
      .attr('r', 0)
      .attr('opacity', 0)
      .remove();

    // Enter animation
    const dotsEnter = dots.enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .attr('fill', color)
      .attr('opacity', 0)
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    // Merge and update - smoothly transition to new positions
    dots.merge(dotsEnter)
      .transition()
      .duration(500)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .attr('fill', color)
      .attr('opacity', 0.7);

    // Add hover events
    g.selectAll<SVGCircleElement, ScatterData>('.dot')
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('opacity', 1);
        
        // Show tooltip
        const dotX = xScale(d.x);
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
          .attr('r', 5)
          .attr('opacity', 0.7);
        
        // Remove tooltip
        g.selectAll('.tooltip').remove();
      });

  }, [data, dimensions, xLabel, yLabel, color]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default ScatterGraph;