import React, { useEffect, useState, useMemo } from "react";
import * as d3 from 'd3';
import { loadStudentData, StudentRecord, filterData, FilterCriteria } from "../data/data";
import Aurora from "../components/Aurora";
import BoxPlot, { BoxPlotData } from '../components/BoxPlot';
import ChartContainer from '../components/ChartContainer';
import BarChart, { BarChartData } from '../components/BarChart';
import WorldMap from "../components/WorldMap";
import FilterSidebar from "../components/FilterSideBar";

const AnalyzeData: React.FC = () => {
  const [originalData, setOriginalData] = useState<StudentRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({});
  const [data, setData] = useState<StudentRecord[]>([]);
  
  // New State for Tabs
  const [activeTab, setActiveTab] = useState<string>('Platform Usage');

  useEffect(() => {
    loadStudentData("/data/dataset.csv").then((parsed: StudentRecord[]) => {
      setOriginalData(parsed);
    });
  }, []);

  useEffect(() => {
    setData(filterData(originalData, activeFilters));
  }, [originalData, activeFilters]);

  const [boxPlotGrouping, setBoxPlotGrouping] = useState<keyof StudentRecord>('Academic_Level');
  const [barChartGrouping, setBarChartGrouping] = useState<keyof StudentRecord>('Academic_Level');

  // --- Data Processing Memoization ---
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

  const tabs = [
    'Platform Usage',
    'Academic Performance',
    'Mental Health',
    'Relationships',
  ];

  return (
    <div className="relative min-h-screen pt-24 text-white bg-gradient-to-b from-[#1a0d26] via-[#2a1a3a] to-[#1a0d26] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora blend={0.5} amplitude={1.2} speed={0.5} />
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-10 h-[calc(100vh-6rem)] flex flex-col">

        {/* --- TABS --- */}
        <div className="flex space-x-1 mb-4 bg-gray-900/40 p-1 rounded-lg w-fit backdrop-blur-sm border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-[#69b3a2] text-white shadow-xl shadow-[#69b3a2]/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">

          <FilterSidebar
            originalData={originalData}
            data={data}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />

          <div className="flex-1 flex flex-col overflow-hidden rounded-lg shadow-lg">

          {/* --- CHARTS (Dense Grid) --- */}
            <main className="flex-1 min-w-0 overflow-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
            {/* Using a Grid layout to fit more charts on one page. 
               2 columns on large screens, gaps increased to avoid overlap. 
            */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              <div className="h-[560px]"> {/* Increased fixed height container for uniformity */}
              <ChartContainer title="Usage (Box Plot)">
                <div className="mb-2 flex items-center justify-end">
                 <select
                  onChange={(e) => setBoxPlotGrouping(e.target.value as keyof StudentRecord)}
                  value={boxPlotGrouping}
                  className="bg-gray-700/50 text-white py-1 px-2 rounded border border-white/10 text-xs"
                >
                  {boxPlotGroupingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                </div>
                <div className="h-[400px]"> {/* Larger internal chart area */}
                <BoxPlot data={boxPlotData} yMax={yMax} />
                </div>
              </ChartContainer>
              </div>

              <div className="h-[480px]">
              <ChartContainer title="Demographics (Bar Chart)">
                <div className="mb-2 flex items-center justify-end">
                <select
                  onChange={(e) => setBarChartGrouping(e.target.value as keyof StudentRecord)}
                  value={barChartGrouping}
                  className="bg-gray-700/50 text-white py-1 px-2 rounded border border-white/10 text-xs"
                >
                  {barChartGroupingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                </div>
                <div className="h-[400px]">
                <BarChart data={barChartData} />
                </div>
              </ChartContainer>
              </div>

              {/* Map Spans full width on bottom */}
              <div className="h-[640px] xl:col-span-2">
              <ChartContainer title="Geographic Distribution">
                <div className="h-[590px] overflow-hidden">
                <WorldMap studentData={data} />
                </div>
              </ChartContainer>
              </div>

            </div>
            </main>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AnalyzeData;