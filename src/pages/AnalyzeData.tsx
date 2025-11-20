import React, { useEffect, useState, useMemo } from "react";
import * as d3 from 'd3';
import { loadStudentData, StudentRecord, filterData, FilterCriteria } from "../data/data";
import Aurora from "../components/Aurora";
import BoxPlot, { BoxPlotData } from '../components/BoxPlot';
import ChartContainer from '../components/ChartContainer';
import BarChart, { BarChartData } from '../components/BarChart';
import LineChart, { LineChartData } from '../components/LineChart';
import PieChart, { PieChartData } from '../components/PieChart';
import DonutChart, { DonutChartData } from '../components/DonutChart';
import ScatterGraph, { ScatterData } from '../components/ScatterGraph';
import WorldMap from "../components/WorldMap";
import FilterSidebar from "../components/FilterSideBar";

const AnalyzeData: React.FC = () => {
  const [originalData, setOriginalData] = useState<StudentRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({});
  const [data, setData] = useState<StudentRecord[]>([]);
  
  // New State for Tabs
  const [activeTab, setActiveTab] = useState<string>('Mental Health');

  useEffect(() => {
    loadStudentData("/data/dataset.csv").then((parsed: StudentRecord[]) => {
      setOriginalData(parsed);
    });
  }, []);

  useEffect(() => {
    setData(filterData(originalData, activeFilters));
  }, [originalData, activeFilters]);

  // --- Platform Usage Tab Data ---
  const platformPieData = useMemo((): PieChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Most_Used_Platform);
    return Array.from(counts, ([label, value]) => ({ label, value }));
  }, [data]);

  const usageByAgeData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgByAge = d3.rollup(data, v => d3.mean(v, d => d.Avg_Daily_Usage_Hours) || 0, d => d.Age);
    return Array.from(avgByAge, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  const usageBoxPlotData = useMemo((): BoxPlotData[] => {
    if (data.length === 0) return [];
    const groupedData = d3.group(data, d => d.Most_Used_Platform);
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
  }, [data]);

  // --- Academic Performance Tab Data ---
  const academicImpactData = useMemo((): PieChartData[] => {
    if (data.length === 0) return [];
    const yesCount = data.filter(d => d.Affects_Academic_Performance).length;
    const noCount = data.length - yesCount;
    return [
      { label: 'Negatively Affected', value: yesCount },
      { label: 'Not Affected', value: noCount }
    ];
  }, [data]);

  const academicLevelData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Academic_Level);
    return Array.from(counts, ([label, value]) => ({ label, value }));
  }, [data]);

  // --- Mental Health Tab Data ---
  const mentalHealthByUsageData = useMemo((): ScatterData[] => {
    if (data.length === 0) return [];
    return data.map(d => ({
      x: d.Avg_Daily_Usage_Hours,
      y: d.Mental_Health_Score
    }));
  }, [data]);

  const sleepByUsageData = useMemo((): ScatterData[] => {
    if (data.length === 0) return [];
    return data.map(d => ({
      x: d.Avg_Daily_Usage_Hours,
      y: d.Sleep_Hours_Per_Night
    }));
  }, [data]);

  const avgMentalHealthByAgeData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgByAge = d3.rollup(data, v => d3.mean(v, d => d.Mental_Health_Score) || 0, d => d.Age);
    return Array.from(avgByAge, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  const avgSleepByAgeData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgByAge = d3.rollup(data, v => d3.mean(v, d => d.Sleep_Hours_Per_Night) || 0, d => d.Age);
    return Array.from(avgByAge, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  // --- Relationships Tab Data ---
  const relationshipStatusData = useMemo((): DonutChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Relationship_Status);
    return Array.from(counts, ([label, value]) => ({ label, value }));
  }, [data]);

  const conflictsData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Conflicts_Over_Social_Media);
    return Array.from(counts, ([label, value]) => ({ label: String(label), value }))
      .sort((a, b) => Number(a.label) - Number(b.label));
  }, [data]);

  const conflictsByRelationshipData = useMemo((): BoxPlotData[] => {
    if (data.length === 0) return [];
    const groupedData = d3.group(data, d => d.Relationship_Status);
    return Array.from(groupedData, ([key, group]) => {
      const values = group.map(d => d.Conflicts_Over_Social_Media).sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25)!;
      const median = d3.quantile(values, 0.5)!;
      const q3 = d3.quantile(values, 0.75)!;
      const interQuantileRange = q3 - q1;
      const min = Math.max(0, q1 - 1.5 * interQuantileRange);
      const max = Math.min(d3.max(values)!, q3 + 1.5 * interQuantileRange);
      return { key: String(key), values: { q1, median, q3, min, max } };
    });
  }, [data]);

  const yMax = useMemo(() => d3.max(data, d => d.Avg_Daily_Usage_Hours) || 0, [data]);
  const conflictsYMax = useMemo(() => d3.max(data, d => d.Conflicts_Over_Social_Media) || 0, [data]);

  const tabs = [
    'Mental Health',
    'Academic Performance',
    'Platform Usage',
    'Relationships',
    'Geographic',
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

          {/* --- CHARTS --- */}
            <main className="flex-1 min-w-0 overflow-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
            
            {activeTab === 'Geographic' && (
              /* Geographic Tab - Only Map */
              <div className="h-full">
                <ChartContainer title="Geographic Distribution">
                  <div className="h-[calc(100vh-14rem)] overflow-hidden">
                    <WorldMap studentData={data} />
                  </div>
                </ChartContainer>
              </div>
            )}

            {activeTab === 'Platform Usage' && (
              /* Platform Usage Tab */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                <div className="h-[480px]">
                  <ChartContainer title="Platform Distribution">
                    <div className="h-[400px]">
                      <PieChart data={platformPieData} />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px]">
                  <ChartContainer title="Usage by Platform">
                    <div className="h-[400px]">
                      <BoxPlot data={usageBoxPlotData} yMax={yMax} />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px] xl:col-span-2">
                  <ChartContainer title="Average Daily Usage by Age">
                    <div className="h-[400px]">
                      <LineChart 
                        data={usageByAgeData} 
                        xLabel="Age" 
                        yLabel="Avg Daily Usage (hours)"
                        color="#3b82f6"
                      />
                    </div>
                  </ChartContainer>
                </div>

              </div>
            )}

            {activeTab === 'Academic Performance' && (
              /* Academic Performance Tab */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                <div className="h-[480px]">
                  <ChartContainer title="Academic Impact">
                    <div className="h-[400px]">
                      <PieChart data={academicImpactData} />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px]">
                  <ChartContainer title="Students by Academic Level">
                    <div className="h-[400px]">
                      <BarChart data={academicLevelData} xLabel="Academic Level" yLabel="Number of Students" />
                    </div>
                  </ChartContainer>
                </div>

              </div>
            )}

            {activeTab === 'Mental Health' && (
              /* Mental Health Tab */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                <div className="h-[480px]">
                  <ChartContainer title="Mental Health vs Usage">
                    <div className="h-[400px]">
                      <ScatterGraph data={mentalHealthByUsageData} xLabel="Daily Usage (hours)" yLabel="Mental Health Score" color="#8b5cf6" />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px]">
                  <ChartContainer title="Sleep Hours vs Usage">
                    <div className="h-[400px]">
                      <ScatterGraph data={sleepByUsageData} xLabel="Daily Usage (hours)" yLabel="Sleep Hours" color="#ec4899" />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px]">
                  <ChartContainer title="Mental Health Score by Age">
                    <div className="h-[400px]">
                      <LineChart 
                        data={avgMentalHealthByAgeData} 
                        xLabel="Age" 
                        yLabel="Mental Health Score"
                        color="#14b8a6"
                      />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px]">
                  <ChartContainer title="Sleep Hours by Age">
                    <div className="h-[400px]">
                      <LineChart 
                        data={avgSleepByAgeData} 
                        xLabel="Age" 
                        yLabel="Sleep Hours"
                        color="#f59e0b"
                      />
                    </div>
                  </ChartContainer>
                </div>

              </div>
            )}

            {activeTab === 'Relationships' && (
              /* Relationships Tab */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                <div className="h-[480px]">
                  <ChartContainer title="Relationship Status">
                    <div className="h-[400px]">
                      <DonutChart data={relationshipStatusData} centerText={`${data.length}`} />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px]">
                  <ChartContainer title="Social Media Conflicts">
                    <div className="h-[400px]">
                      <BarChart data={conflictsData} xLabel="Conflict Level" yLabel="Number of Students" />
                    </div>
                  </ChartContainer>
                </div>

                <div className="h-[480px] xl:col-span-2">
                  <ChartContainer title="Conflicts by Relationship Status">
                    <div className="h-[400px]">
                      <BoxPlot data={conflictsByRelationshipData} yMax={conflictsYMax} />
                    </div>
                  </ChartContainer>
                </div>

              </div>
            )}

            </main>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AnalyzeData;