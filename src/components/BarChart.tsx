import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  orientation?: 'vertical' | 'horizontal';
  xLabel?: string;
  yLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, orientation = 'vertical', xLabel, yLabel }) => {
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

  const margin = { top: 20, right: 20, bottom: 60, left: 60 }; // Adjusted margins for labels
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  const max = d3.max(data, d => d.value) || 0;

  let xScale: any;
  let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

  if (orientation === 'vertical') {
    xScale = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.1);

    yScale = d3.scaleLinear()
      .domain([0, max])
      .range([chartHeight, 0]);
  } else {
    xScale = d3.scaleLinear()
      .domain([0, max])
      .range([0, chartWidth]);

    yScale = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, chartHeight])
      .padding(0.1);
  }

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous chart elements

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scale for vibrant colors
    const colorScale = d3.scaleSequential()
      .domain([0, data.length - 1])
      .interpolator(d3.interpolateRgb('#ec4899', '#f97316')); // Pink to Orange

    if (orientation === 'vertical') {
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleBand<string>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);
      g.append('g')
        .call(d3.axisLeft(yScale as d3.ScaleLinear<number, number>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);
    } else {
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleLinear<number, number>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);
      g.append('g')
        .call(d3.axisLeft(yScale as d3.ScaleBand<string>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);
    }

    g.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(255,255,255,0.3)");

    // Axis Labels
    if (xLabel) {
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 45)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('font-weight', '500')
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
        .attr('font-weight', '500')
        .text(yLabel);
    }

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>)(d.label)! : xScale(0))
      .attr('y', d => orientation === 'vertical' ? (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>)(d.label)!)
      .attr('width', d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>).bandwidth() : (xScale as d3.ScaleLinear<number, number>)(d.value))
      .attr('height', d => orientation === 'vertical' ? chartHeight - (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>).bandwidth())
      .attr('fill', (_d, i) => colorScale(i))
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1);

  }, [data, orientation, dimensions, xLabel, yLabel]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default BarChart;
