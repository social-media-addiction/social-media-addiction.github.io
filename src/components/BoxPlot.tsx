import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

export interface BoxPlotData {
  key: string;
  values: {
    q1: number;
    median: number;
    q3: number;
    min: number;
    max: number;
  };
}

interface BoxPlotProps {
  data: BoxPlotData[];
  yMax: number;
  xLabel?: string; // Optional x-axis label
  yLabel?: string; // Optional y-axis label
}

const BoxPlot: React.FC<BoxPlotProps> = ({ data, yMax, yLabel }) => {
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

    updateDimensions(); // Set initial dimensions

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

  useEffect(() => {
    if (data.length === 0 || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 50 }; // Adjusted margins for responsiveness
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([chartHeight, 0]);

    const yAxis = d3.axisLeft(y).ticks(5);
    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll("text")
      .attr("fill", "white")
      .attr("font-size", 11);
    yAxisG.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(255,255,255,0.3)");

    const categories = data.map(d => d.key);
    const x = d3.scaleBand()
      .range([0, chartWidth])
      .domain(categories)
      .padding(0.2);

    const xAxis = d3.axisBottom(x);
    const xAxisG = g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);
      
    xAxisG.selectAll('text')
      .style('text-anchor', 'center')
      .attr('dy', '1em')
      .attr("fill", "white")
      .attr("font-size", 11);

    xAxisG.selectAll(".domain, .tick line")
        .attr("stroke", "rgba(255,255,255,0.3)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10) // Adjusted position
        .attr("x",0 - (chartHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yLabel || "Avg Daily Usage (Hours)")
        .attr("fill", "white")
        .attr("font-size", 13)
        .attr("font-weight", "500");

    // Color scale for vibrant colors
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#f59e0b']);

    data.forEach((d) => {
      const { key, values } = d;
      const { q1, median, q3, min, max } = values;
      const boxWidth = x.bandwidth();
      const boxColor = colorScale(key) as string;

      // Create a group for this box
      const boxGroup = g.append('g')
        .attr('class', 'box-group')
        .style('cursor', 'pointer');

      boxGroup.append('line')
        .attr('x1', x(key)! + boxWidth / 2)
        .attr('x2', x(key)! + boxWidth / 2)
        .attr('y1', y(min))
        .attr('y2', y(max))
        .attr('stroke', "rgba(255,255,255,0.5)")
        .attr('stroke-width', 2);

      boxGroup.append('rect')
        .attr('x', x(key)!)
        .attr('y', y(q3))
        .attr('height', y(q1) - y(q3))
        .attr('width', boxWidth)
        .attr('stroke', "rgba(255,255,255,0.5)")
        .attr('stroke-width', 2)
        .style('fill', boxColor);

      boxGroup.selectAll(`median-line-${key}`)
        .data([median])
        .enter()
        .append('line')
        .attr('x1', x(key)!)
        .attr('x2', x(key)! + boxWidth)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', '#1f2937')
        .attr('stroke-width', 3);

      // Add hover interactions
      boxGroup
        .on('mouseover', function() {
          d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
          
          // Show tooltip
          const boxX = x(key)! + boxWidth / 2;
          const boxY = y(q3) - 10;
          
          g.append('g')
            .attr('class', 'tooltip')
            .attr('transform', `translate(${boxX},${boxY})`);
          
          const tooltip = g.select('.tooltip');
          
          // Background
          tooltip.append('rect')
            .attr('x', -35)
            .attr('y', -30)
            .attr('width', 70)
            .attr('height', 35)
            .attr('rx', 5)
            .attr('fill', 'rgba(31, 41, 55, 0.95)')
            .attr('stroke', '#69b3a2')
            .attr('stroke-width', 2);
          
          // Median value
          tooltip.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -5)
            .attr('fill', '#69b3a2')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .text(median.toFixed(1));
        })
        .on('mouseout', function() {
          d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('opacity', 1);
          
          // Remove tooltip
          g.selectAll('.tooltip').remove();
        });
    });

  }, [data, yMax, dimensions]); // Re-run effect when dimensions change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px' }}> {/* Set a default height or make it dynamic */}
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default BoxPlot;