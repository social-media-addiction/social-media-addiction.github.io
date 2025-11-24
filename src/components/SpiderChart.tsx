import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

// Define the shape of a single data entry for one "spoke"
export interface SpiderChartDataItem {
  axis: string; // The name of the variable (e.g., "Strength", "Intelligence")
  value: number; // The value for this variable
}

// Define the shape for one "series" (e.g., "Hero A" or "Product X")
export interface SpiderChartSeries {
  name: string; // Name of the series (for legend and identification)
  data: SpiderChartDataItem[];
  color?: string; // Optional color for this series
}

// Configuration for the entire chart
export interface SpiderChartConfig {
  width?: number;
  height?: number;
  maxValue?: number; // Maximum value for all axes
  levels?: number; // Number of concentric circles/polygons
  labelFactor?: number; // How far out the labels sit
  wrapWidth?: number; // Max pixel width of a label wrapper
  opacityArea?: number; // Opacity of the fill area
  dotRadius?: number; // Size of the dots
  opacityDots?: number; // Opacity of the dots
  strokeWidth?: number; // Width of the connecting lines
  roundStrokes?: boolean; // Round the corners of the polygon
  colorScale?: d3.ScaleOrdinal<string, string>; // D3 color scale to use if colors not provided in series
  margin?: { top: number; right: number; bottom: number; left: number };
}

interface SpiderChartProps {
  data: SpiderChartSeries[];
  config?: SpiderChartConfig;
}

const SpiderChart: React.FC<SpiderChartProps> = ({ data, config }) => {
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

  const defaultConfig: Required<SpiderChartConfig> = {
    width: 600,
    height: 600,
    maxValue: 100, // Default max value if not explicitly set
    levels: 5,
    labelFactor: 1.25,
    wrapWidth: 100,
    opacityArea: 0.35,
    dotRadius: 4,
    opacityDots: 0.8,
    strokeWidth: 2,
    roundStrokes: false,
    colorScale: d3.scaleOrdinal(d3.schemeCategory10), // Default D3 color scheme
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  };

  const finalConfig = { ...defaultConfig, ...config };

  const {
    levels,
    labelFactor,
    wrapWidth,
    opacityArea,
    dotRadius,
    opacityDots,
    strokeWidth,
    roundStrokes,
    colorScale,
    margin,
  } = finalConfig;

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear SVG on re-render

    // Default axes if no data is present
    const defaultAxes = ["Addiction", "Sleep Loss", "Conflicts", "Academic Impact", "Mental Damage"];
    const allAxes = (data && data.length > 0) ? data[0].data.map(d => d.axis) : defaultAxes;
    const numAxes = allAxes.length;

    // Calculate dynamic radius based on available space
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth / 2, chartHeight / 2);

    // Determine the overall max value from all data points if not provided
    const dynamicMaxValue = finalConfig.maxValue || d3.max(data, series => d3.max(series.data, d => d.value)) || 0;

    // Scale for the radius
    const rScale = d3.scaleLinear()
      .domain([0, dynamicMaxValue])
      .range([0, radius]);

    // const svg = d3.select(svgRef.current);
    // svg.selectAll('*').remove(); // Clear SVG on re-render

    const g = svg.append('g')
      .attr('transform', `translate(${dimensions.width / 2},${dimensions.height / 2 - 20})`); // Center the chart and move up slightly

    // --- Draw the Radar Grid (Concentric Circles/Polygons) ---
    // Create the circle axes (lines radiating from the center)
    const axisGrid = g.append('g').attr('class', 'axis-grid');

    axisGrid.selectAll('.levels')
      .data(d3.range(1, levels + 1).reverse())
      .enter()
      .append('circle')
      .attr('class', 'grid-level')
      .attr('r', d => radius / levels * d)
      .style('fill', '#CDCDCD')
      .style('stroke', '#CDCDCD')
      .style('fill-opacity', 0.1)
      .style('stroke-opacity', 0.75)
      .style('stroke-width', 0.3);

    // Add text labels for the levels
    axisGrid.selectAll('.axisLabel')
      .data(d3.range(1, levels + 1).reverse())
      .enter().append('text')
      .attr('class', 'axis-label')
      .attr('x', 4)
      .attr('y', d => (-d * radius) / levels)
      .attr('dy', '0.4em')
      .style('font-size', '10px')
      .attr('fill', '#737373')
      .text(d => (dynamicMaxValue * d / levels).toFixed(0));

    // --- Draw the Axes (Spokes) ---
    const axis = axisGrid.selectAll('.axis')
      .data(allAxes)
      .enter()
      .append('g')
      .attr('class', 'axis');

    // Append the lines (spokes)
    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (_d, i) => rScale(dynamicMaxValue * 1.1) * Math.cos(angle(i))) // Extend slightly beyond max
      .attr('y2', (_d, i) => rScale(dynamicMaxValue * 1.1) * Math.sin(angle(i))) // Extend slightly beyond max
      .attr('class', 'line')
      .style('stroke', 'white')
      .style('stroke-width', '1px')
      .style('opacity', 0.5);

    // Append the labels for each axis
    axis.append('text')
      .attr('class', 'legend')
      .style('font-size', '11px')
      .attr('fill', 'white')
      .attr('x', (_d, i) => {
        const x = rScale(dynamicMaxValue * labelFactor) * Math.cos(angle(i));
        return x;
      })
      .attr('y', (_d, i) => {
        const y = rScale(dynamicMaxValue * labelFactor) * Math.sin(angle(i));
        return y;
      })
      .attr('text-anchor', (_d, i) => {
        const x = rScale(dynamicMaxValue * labelFactor) * Math.cos(angle(i));
        if (Math.abs(x) < 5) return 'middle';
        return x > 0 ? 'start' : 'end';
      })
      .text(d => d)
      .call(wrap, wrapWidth); 

    // --- Draw the Radar Areas and Dots ---
    // const radarLine = d3.lineRadial<SpiderChartDataItem>()
    //   .curve(d3.curveCardinalClosed)
    //   .radius(d => rScale(d.value))
    //   .angle((_d, i) => angle(i) + Math.PI / 2); 

    const radarLineGenerator = d3.lineRadial<SpiderChartDataItem>()
        .curve(roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((_d, i) => angle(i) + Math.PI / 2);

    if (data && data.length > 0) {
      const blobWrapper = g.selectAll('.radarWrapper')
        .data(data)
        .enter().append('g')
        .attr('class', 'radarWrapper');

      // Append the polygons (areas)
      blobWrapper.append('path')
        .attr('class', 'radarArea')
        .attr('d', d => radarLineGenerator(d.data))
        .style('fill', (d, i) => d.color || colorScale(d.name || i.toString()))
        .style('fill-opacity', opacityArea)
        .style('pointer-events', 'none');

      // Append the outlines
      blobWrapper.append('path')
        .attr('class', 'radarStroke')
        .attr('d', d => radarLineGenerator(d.data))
        .style('stroke-width', strokeWidth + 'px')
        .style('stroke', (d, i) => d.color || colorScale(d.name || i.toString()))
        .style('fill', 'none')
        .style('filter', 'url(#glow)')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
        // Select the parent wrapper group
        const parentWrapper = d3.select(this.parentNode as Element);
        
        // Bring parent wrapper to front
        parentWrapper.raise();
        
        // Dim all other wrappers
        g.selectAll('.radarWrapper')
          .transition().duration(200)
          .style('opacity', 0.1);
          
        // Highlight this wrapper
        parentWrapper
          .transition().duration(200)
          .style('opacity', 1);
          
        // Optional: Make area more opaque
        parentWrapper.select('.radarArea')
          .transition().duration(200)
          .style('fill-opacity', 0.7);
        
        // Create tooltip
        const svgElement = svg.node();
        if (!svgElement) return;
        
        const [mouseX, mouseY] = d3.pointer(event, svgElement);
        
        // Remove any existing tooltips
        svg.selectAll('.spider-tooltip').remove();
        
        const tooltip = svg.append('g')
          .attr('class', 'spider-tooltip')
          .attr('transform', `translate(${mouseX + 10}, ${mouseY - 10})`)
          .style('pointer-events', 'none');
        
        // Calculate tooltip dimensions based on content
        const metrics = d.data;
        const lineHeight = 18;
        const padding = 12;
        const titleHeight = 22;
        const tooltipWidth = 180;
        const tooltipHeight = titleHeight + (metrics.length * lineHeight) + (padding * 2);
        
        // Background with glassmorphism
        tooltip.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', tooltipWidth)
          .attr('height', tooltipHeight)
          .attr('rx', 8)
          .attr('fill', 'rgba(31, 41, 55, 0.95)')
          .attr('stroke', d.color || colorScale(d.name || ''))
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))');
        
        // Platform name (title)
        tooltip.append('text')
          .attr('x', padding)
          .attr('y', padding + 14)
          .attr('fill', 'white')
          .attr('font-size', 14)
          .attr('font-weight', 'bold')
          .text(d.name);
        
        // Metric values
        metrics.forEach((metric, i) => {
          const yPos = padding + titleHeight + (i * lineHeight) + 12;
          
          // Metric name
          tooltip.append('text')
            .attr('x', padding)
            .attr('y', yPos)
            .attr('fill', '#9ca3af')
            .attr('font-size', 11)
            .text(`${metric.axis}:`);
          
          // Metric value
          tooltip.append('text')
            .attr('x', tooltipWidth - padding)
            .attr('y', yPos)
            .attr('fill', 'white')
            .attr('font-size', 11)
            .attr('font-weight', '600')
            .attr('text-anchor', 'end')
            .text(metric.value.toFixed(2));
        });
      })
      .on('mouseout', function() {
        // Restore all wrappers
        g.selectAll('.radarWrapper')
          .transition().duration(200)
          .style('opacity', 1);
          
        // Restore area opacity
        g.selectAll('.radarArea')
          .transition().duration(200)
          .style('fill-opacity', opacityArea);
        
        // Remove tooltip
        svg.selectAll('.spider-tooltip').remove();
      });

      // Append the dots
      blobWrapper.selectAll('.radarCircle')
        .data(d => d.data)
        .enter().append('circle')
        .attr('class', 'radarCircle')
        .attr('r', dotRadius)
        .attr('cx', (_d, i) => rScale(_d.value) * Math.cos(angle(i)))
        .attr('cy', (_d, i) => rScale(_d.value) * Math.sin(angle(i)))
        .style('fill', function(this: SVGElement) {
           // Access the parent data to get the color
           const parentData = d3.select(this.parentNode as Element).datum() as SpiderChartSeries;
           return parentData.color || colorScale(parentData.name);
        })
        .style('fill-opacity', opacityDots)
        .style('pointer-events', 'none');
    }

    // --- Helper Functions ---
    // Function to calculate the angle for each axis
    function angle(i: number) {
        return Math.PI / 2 + (2 * Math.PI * i / numAxes); // Start at 12 o'clock, go clockwise
    }

    // Function to wrap text labels
    function wrap(text: d3.Selection<SVGTextElement, string, SVGGElement, unknown>, width: number) {
      text.each(function(this: SVGTextElement) {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word: string | undefined;
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.4; // ems
        const y = text.attr('y');
        const x = text.attr('x');
        const dy = parseFloat(text.attr('dy'));
        let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node() && tspan.node()!.getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
          }
        }
      });
    }

  }, [data, dimensions, finalConfig, levels, labelFactor, wrapWidth, opacityArea, dotRadius, opacityDots, strokeWidth, roundStrokes, colorScale, margin]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <svg ref={svgRef} width="100%" height="100%">
        {/* Optional: Define a filter for glow effect */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default SpiderChart;