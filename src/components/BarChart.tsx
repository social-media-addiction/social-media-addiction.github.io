import React, { useEffect, useRef } from 'react';
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
  const margin = { top: 20, right: 30, bottom: 40, left: 90 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);

  const max = d3.max(data, d => d.value) || 0;

  let xScale: any;
  let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

  if (orientation === 'vertical') {
    xScale = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.1);

    yScale = d3.scaleLinear()
      .domain([0, max])
      .range([height, 0]);
  } else {
    xScale = d3.scaleLinear()
      .domain([0, max])
      .range([0, width]);

    yScale = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, height])
      .padding(0.1);
  }

  useEffect(() => {
    if (xAxisRef.current) {
      if (orientation === 'vertical') {
        d3.select(xAxisRef.current).call(d3.axisBottom(xScale as d3.ScaleBand<string>));
      } else {
        d3.select(xAxisRef.current).call(d3.axisBottom(xScale as d3.ScaleLinear<number, number>));
      }
    }
    if (yAxisRef.current) {
      if (orientation === 'vertical') {
        d3.select(yAxisRef.current).call(d3.axisLeft(yScale as d3.ScaleLinear<number, number>));
      } else {
        d3.select(yAxisRef.current).call(d3.axisLeft(yScale as d3.ScaleBand<string>));
      }
    }
  }, [xScale, yScale, orientation]);

  return (
      <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {orientation === 'vertical' ? (
            <>
              <g transform={`translate(0,${height})`} ref={xAxisRef} />
              <g ref={yAxisRef} />
            </>
          ) : (
            <>
              <g transform={`translate(0,${height})`} ref={xAxisRef} />
              <g ref={yAxisRef} />
            </>
          )}
          {data.map(d => (
            <rect
              key={d.label}
              x={orientation === 'vertical' ? (xScale as d3.ScaleBand<string>)(d.label) : xScale(0)}
              y={orientation === 'vertical' ? (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>)(d.label)}
              width={orientation === 'vertical' ? (xScale as d3.ScaleBand<string>).bandwidth() : (xScale as d3.ScaleLinear<number, number>)(d.value)}
              height={orientation === 'vertical' ? height - (yScale as d3.ScaleLinear<number, number>)(d.value) : (yScale as d3.ScaleBand<string>).bandwidth()}
              fill="#69b3a2"
            />
          ))}
        </g>
      </svg>
  );
};

export default BarChart;
