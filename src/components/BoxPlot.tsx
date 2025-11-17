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
}

const BoxPlot: React.FC<BoxPlotProps> = ({ data, yMax }) => {
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
      .attr("font-size", 12);
    yAxisG.selectAll(".domain, .tick line")
      .attr("stroke", "white");

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
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr("fill", "white")
      .attr("font-size", 12);

    xAxisG.selectAll(".domain, .tick line")
        .attr("stroke", "white");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10) // Adjusted position
        .attr("x",0 - (chartHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Avg Daily Usage (Hours)")
        .attr("fill", "white")
        .attr("font-size", 13)
        .attr("font-weight", "500");

    data.forEach(d => {
      const { key, values } = d;
      const { q1, median, q3, min, max } = values;
      const boxWidth = x.bandwidth();

      g.append('line')
        .attr('x1', x(key)! + boxWidth / 2)
        .attr('x2', x(key)! + boxWidth / 2)
        .attr('y1', y(min))
        .attr('y2', y(max))
        .attr('stroke', "white");

      g.append('rect')
        .attr('x', x(key)!)
        .attr('y', y(q3))
        .attr('height', y(q1) - y(q3))
        .attr('width', boxWidth)
        .attr('stroke', "white")
        .style('fill', '#69b3a2');

      g.selectAll(`median-line-${key}`)
        .data([median])
        .enter()
        .append('line')
        .attr('x1', x(key)!)
        .attr('x2', x(key)! + boxWidth)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', '#589a89')
        .attr('stroke-width', 2);
    });

  }, [data, yMax, dimensions]); // Re-run effect when dimensions change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px' }}> {/* Set a default height or make it dynamic */}
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default BoxPlot;