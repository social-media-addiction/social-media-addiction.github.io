import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  orientation?: 'vertical' | 'horizontal';
}

const BarChart: React.FC<BarChartProps> = ({ data, orientation = 'vertical' }) => {
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

  const margin = { top: 20, right: 20, bottom: 60, left: 50 }; // Adjusted margins for responsiveness
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

    if (orientation === 'vertical') {
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleBand<string>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 12);
      g.append('g')
        .call(d3.axisLeft(yScale as d3.ScaleLinear<number, number>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 12);
    } else {
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleLinear<number, number>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 12);
      g.append('g')
        .call(d3.axisLeft(yScale as d3.ScaleBand<string>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 12);
    }

    g.selectAll(".domain, .tick line")
      .attr("stroke", "white");

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>)(d.label)! : xScale(0))
      .attr('y', d => orientation === 'vertical' ? (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>)(d.label)!)
      .attr('width', d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>).bandwidth() : (xScale as d3.ScaleLinear<number, number>)(d.value))
      .attr('height', d => orientation === 'vertical' ? chartHeight - (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>).bandwidth())
      .attr('fill', '#69b3a2');

  }, [data, orientation, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px' }}> {/* Set a default height or make it dynamic */}
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default BarChart;
