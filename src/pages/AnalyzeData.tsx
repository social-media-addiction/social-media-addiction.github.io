import React, { useEffect, useState, useMemo } from "react";
import * as d3 from 'd3';
import { loadStudentData, StudentRecord } from "../data/data";
import Aurora from "../components/Aurora";
import BoxPlot, { BoxPlotData } from '../components/BoxPlot';
import ChartContainer from '../components/ChartContainer';
import BarChart, { BarChartData } from '../components/BarChart';

const AnalyzeData: React.FC = () => {
  const [data, setData] = useState<StudentRecord[]>([]);
  useEffect(() => {
    loadStudentData("/data/dataset.csv").then((parsed: StudentRecord[]) => {
      setData(parsed);
    });
  }, []);

  const [boxPlotGrouping, setBoxPlotGrouping] = useState<keyof StudentRecord>('Academic_Level');
  const [barChartGrouping, setBarChartGrouping] = useState<keyof StudentRecord>('Academic_Level');

  const boxPlotData = useMemo((): BoxPlotData[] => {
    if (data.length === 0) return [];

    const groupedData = d3.group(data, d => d[boxPlotGrouping]);
    
    return Array.from(groupedData, ([key, group]) => {
      const values = group.map(d => d.Avg_Daily_Usage_Hours).sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25)!;
      const median = d3.quantile(values, 0.5)!;
      const q3 = d3.quantile(values, 0.75)!;
      const interQuantileRange = q3 - q1;
      const min = Math.max(0, q1 - 1.5 * interQuantileRange);
      const max = Math.min(d3.max(values)!, q3 + 1.5 * interQuantileRange);
      
      return { key: String(key), values: { q1, median, q3, min, max } };
    });
  }, [data, boxPlotGrouping]);

  const barChartData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];

    const counts = d3.rollup(data, v => v.length, d => d[barChartGrouping]);
    return Array.from(counts, ([key, value]) => ({ label: String(key), value }));
  }, [data, barChartGrouping]);

  const yMax = useMemo(() => d3.max(data, d => d.Avg_Daily_Usage_Hours) || 0, [data]);

  const boxPlotGroupingOptions: (keyof StudentRecord)[] = [
    'Academic_Level',
    'Gender',
    'Relationship_Status',
  ];

  const barChartGroupingOptions: (keyof StudentRecord)[] = [
    'Academic_Level',
    'Gender',
    'Most_Used_Platform',
  ];

  return (
    <div className="relative min-h-screen pt-20 text-white bg-gradient-to-b from-[#1a0d26] via-[#2a1a3a] to-[#1a0d26] overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora blend={0.5} amplitude={1.2} speed={0.5} />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <ChartContainer title="Usage by Demographics (Box Plot)" className="mt-8">
          <select 
            onChange={(e) => setBoxPlotGrouping(e.target.value as keyof StudentRecord)} 
            value={boxPlotGrouping}
            className="bg-gray-700 text-white p-2 rounded mb-4"
          >
            {boxPlotGroupingOptions.map(opt => (
              <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <BoxPlot data={boxPlotData} yMax={yMax} />
        </ChartContainer>
        <ChartContainer title="Count by Demographics (Bar Chart)" className="mt-8">
          <select 
            onChange={(e) => setBarChartGrouping(e.target.value as keyof StudentRecord)} 
            value={barChartGrouping}
            className="bg-gray-700 text-white p-2 rounded mb-4"
          >
            {barChartGroupingOptions.map(opt => (
              <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <BarChart data={barChartData} />
        </ChartContainer>
      </div>
    </div>
  );
};

export default AnalyzeData;