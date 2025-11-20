import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

export interface PieChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
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

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const radius = Math.min(width, height) / 2 - 40;

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Color scale - vibrant colors
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#f59e0b']);

    // Pie generator
    const pie = d3.pie<PieChartData>()
      .value(d => d.value)
      .sort(null);

    // Arc generator
    const arc = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(0)
      .outerRadius(radius + 10);

    // Draw slices
    const slices = g.selectAll('.slice')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'slice');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label) as string)
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover(d) as string);
        
        // Show tooltip
        const [x, y] = arcHover.centroid(d);
        const percentage = ((d.data.value / d3.sum(data, item => item.value)) * 100).toFixed(1);
        
        g.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${x},${y})`);
        
        const tooltip = g.select('.tooltip');
        
        // Background
        tooltip.append('rect')
          .attr('x', -50)
          .attr('y', -30)
          .attr('width', 100)
          .attr('height', 50)
          .attr('rx', 5)
          .attr('fill', 'rgba(31, 41, 55, 0.95)')
          .attr('stroke', '#69b3a2')
          .attr('stroke-width', 2);
        
        // Label
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -10)
          .attr('fill', 'white')
          .attr('font-size', 11)
          .attr('font-weight', 'bold')
          .text(d.data.label.length > 12 ? d.data.label.substring(0, 12) + '...' : d.data.label);
        
        // Percentage
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 10)
          .attr('fill', '#69b3a2')
          .attr('font-size', 14)
          .attr('font-weight', 'bold')
          .text(`${percentage}%`);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc(d) as string);
        
        // Remove tooltip
        g.selectAll('.tooltip').remove();
      });

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(20, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', d => color(d.label) as string)
      .attr('rx', 3);

    legendItems.append('text')
      .attr('x', 25)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', 11)
      .text(d => `${d.label} (${d.value})`);

  }, [data, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default PieChart;
