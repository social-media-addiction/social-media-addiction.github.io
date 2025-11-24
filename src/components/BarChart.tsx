
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { renderToStaticMarkup } from 'react-dom/server';
import { socialMediaColors } from '../components/SocialMediaColors';

export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  orientation?: 'vertical' | 'horizontal';
  xLabel?: string;
  yLabel?: string;
  colours?: string[];
  iconMap?: Record<string, React.ReactNode>;
  isSocialMedia?: boolean;
  colorMap?: Record<string, string>;
}

const BarChart: React.FC<BarChartProps> = ({ data, orientation = 'vertical', xLabel, yLabel, colours, iconMap, isSocialMedia, colorMap }) => {
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



  const margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: orientation === 'horizontal' ? 100 : 60
  };
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

    // Only create the main group once
    let g = svg.select<SVGGElement>('g.main-group');
    if (g.empty()) {
      g = svg.append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    } else {
      // Update transform if margin changes
      g.attr('transform', `translate(${margin.left},${margin.top})`);
    }

    let colorScale: (i: number, label?: string) => string;

    // Priority: colorMap > colours > isSocialMedia > default
    if (colorMap) {
      colorScale = (_i, label) => colorMap[label!] || '#888';
    } else if (colours && colours.length > 0) {
      if (colours.length === 1) {
        colorScale = () => colours[0];
      } else {
        // Create a linear scale for interpolation
        // Map the data indices [0, data.length - 1] to the color range

        // Alternatively, for just 2 colors (start/end), we can just map domain [0, data.length-1] to range [start, end]
        if (colours.length === 2) {
             const linearScale = d3.scaleLinear<string>()
                .domain([0, data.length - 1])
                .range(colours as [string, string])
                .interpolate(d3.interpolateRgb);
             colorScale = (i) => linearScale(i);
        } else {
             // For more than 2 colors, we might want a different approach or just use the linear scale with ticks
             // But for now, let's stick to the simple linear scale for 2 colors which is what we are using
             const linearScale = d3.scaleLinear<string>()
                .domain(colours.map((_, i) => i * (data.length - 1) / (colours.length - 1)))
                .range(colours)
                .interpolate(d3.interpolateRgb);
             colorScale = (i) => linearScale(i);
        }
      }
    } else if (isSocialMedia) {
      colorScale = (_i, label) =>
        socialMediaColors[label!] || "#888"; // fallback
    } else {
      const seq = d3.scaleSequential()
        .domain([0, data.length - 1])
        .interpolator(d3.interpolateRgb('#ec4899', '#f97316'));

      colorScale = (i) => seq(i);
    }

    // Update or create axes
    if (orientation === 'vertical') {
      const xAxisG = g.selectAll<SVGGElement, unknown>('.x-axis').data([null]);
      const xAxisEnter = xAxisG.enter().append('g').attr('class', 'x-axis');
      xAxisG.merge(xAxisEnter)
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleBand<string>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);

      const yAxisG = g.selectAll<SVGGElement, unknown>('.y-axis').data([null]);
      const yAxisEnter = yAxisG.enter().append('g').attr('class', 'y-axis');
      yAxisG.merge(yAxisEnter)
        .call(d3.axisLeft(yScale as d3.ScaleLinear<number, number>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);
    } else {
      const xAxisG = g.selectAll<SVGGElement, unknown>('.x-axis').data([null]);
      const xAxisEnter = xAxisG.enter().append('g').attr('class', 'x-axis');
      xAxisG.merge(xAxisEnter)
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleLinear<number, number>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);

      const yAxisG = g.selectAll<SVGGElement, unknown>('.y-axis').data([null]);
      const yAxisEnter = yAxisG.enter().append('g').attr('class', 'y-axis');
      yAxisG.merge(yAxisEnter)
        .call(d3.axisLeft(yScale as d3.ScaleBand<string>))
        .selectAll("text")
        .attr("fill", "white")
        .attr("font-size", 11);
    }

    g.selectAll(".domain, .tick line")
      .attr("stroke", "rgba(255,255,255,0.3)");

    // Update or create axis labels
    if (xLabel) {
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
    }

    if (yLabel) {
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
        .attr('y', orientation === 'horizontal' ? -85 : -45)
        .text(yLabel);
    }

    // Remove any existing tooltips before updating
    g.selectAll('.tooltip').remove();

    // Bars with animations
    const bars = g.selectAll<SVGRectElement, BarChartData>('.bar')
      .data(data, d => d.label);

    // Exit animation
    bars.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .attr('height', 0)
      .attr('y', chartHeight)
      .remove();

    // Enter animation
    const barsEnter = bars.enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>)(d.label)! : xScale(0))
      .attr('y', d => orientation === 'vertical' ? chartHeight : (yScale as d3.ScaleBand<string>)(d.label)!)
      .attr('width', _d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>).bandwidth() : 0)
      .attr('height', 0)
      .style('fill', (d, i) => colorScale(i, d.label))
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .style('cursor', 'pointer')
      .style('pointer-events', 'none');

    // Merge and update
    const allBars = bars.merge(barsEnter);
    
    // Disable pointer events and start transition
    allBars
      .style('pointer-events', 'none')
      .transition()
      .duration(500)
      .attr('x', d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>)(d.label)! : xScale(0))
      .attr('y', d => orientation === 'vertical' ? (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>)(d.label)!)
      .attr('width', d => orientation === 'vertical' ? (xScale as d3.ScaleBand<string>).bandwidth() : (xScale as d3.ScaleLinear<number, number>)(d.value))
      .attr('height', d => orientation === 'vertical' ? chartHeight - (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>).bandwidth())
      .style('fill', (d, i) => colorScale(i, d.label))
      .attr('opacity', 0.8)
      .on('end', function() {
        // Re-enable pointer events after transition completes
        d3.select(this).style('pointer-events', 'auto');
      });

    // Icons above bars
    if (iconMap) {
      const iconGroup = g.selectAll<SVGGElement, unknown>('.icon-group').data([null]);
      const iconGroupEnter = iconGroup.enter().append('g').attr('class', 'icon-group');
      const iconG = iconGroup.merge(iconGroupEnter);

      const icons = iconG.selectAll<SVGForeignObjectElement, BarChartData>('.bar-icon')
        .data(data, d => d.label);

      icons.exit().remove();

      const iconsEnter = icons.enter().append('foreignObject')
        .attr('class', 'bar-icon')
        .attr('width', 24)
        .attr('height', 24)
        .style('overflow', 'visible');

      icons.merge(iconsEnter)
        .each(function (d) {
          if (iconMap[d.label]) {
            const iconMarkup = renderToStaticMarkup(iconMap[d.label] as React.ReactElement);
            d3.select(this).html(`<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${iconMarkup}</div>`);
          }
        })
        .transition()
        .duration(500)
        .attr('x', d => {
          if (orientation === 'vertical') {
            return (xScale as d3.ScaleBand<string>)(d.label)! + (xScale as d3.ScaleBand<string>).bandwidth() / 2 - 12;
          } else {
            return (xScale as d3.ScaleLinear<number, number>)(d.value) + 5;
          }
        })
        .attr('y', d => {
          if (orientation === 'vertical') {
            return (yScale as d3.ScaleLinear<number, number>)(d.value) - 30;
          } else {
            return (yScale as d3.ScaleBand<string>)(d.label)! + (yScale as d3.ScaleBand<string>).bandwidth() / 2 - 12;
          }
        });
    }

    // Add hover events to all bars
    g.selectAll<SVGRectElement, BarChartData>('.bar')
      .on('mouseenter', function (_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);

        // Remove any existing tooltips first
        g.selectAll('.tooltip').remove();

        // Show tooltip
        const barX = orientation === 'vertical'
          ? (xScale as d3.ScaleBand<string>)(d.label)! + (xScale as d3.ScaleBand<string>).bandwidth() / 2
          : (xScale as d3.ScaleLinear<number, number>)(d.value);
        const barY = orientation === 'vertical'
          ? (yScale as d3.ScaleLinear<number, number>)(d.value) - 10
          : (yScale as d3.ScaleBand<string>)(d.label)! + (yScale as d3.ScaleBand<string>).bandwidth() / 2;

        g.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${barX},${barY})`)
          .style('pointer-events', 'none');

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

        // Value
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -5)
          .attr('fill', '#69b3a2')
          .attr('font-size', 16)
          .attr('font-weight', 'bold')
          .text(d.value.toFixed(1));
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        // Remove tooltip
        g.selectAll('.tooltip').remove();
      });

  }, [data, orientation, dimensions, xLabel, yLabel, colours, iconMap]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ overflow: 'visible' }}></svg>
    </div>
  );
};

export default BarChart;
