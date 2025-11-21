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
import SpiderChart, { SpiderChartSeries } from "../components/SpiderChart";
import { Clock, GraduationCap, Users, Heart, Zap, BookOpen, Globe, Angry, Brain, Bed, ArrowDownRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

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
  // const platformPieData = useMemo((): PieChartData[] => {
  //   if (data.length === 0) return [];
  //   const counts = d3.rollup(data, v => v.length, d => d.Most_Used_Platform);
  //   return Array.from(counts, ([label, value]) => ({ label, value }));
  // }, [data]);

  const platformSpiderData: SpiderChartSeries[] = useMemo(() => {
    if (data.length === 0) return [];

    // 1. Calculate the most used platforms
    const platformCounts = d3.rollup(data, v => v.length, d => d.Most_Used_Platform);
    const totalCount = d3.sum(Array.from(platformCounts.values()));
    const platformPercentages = Array.from(platformCounts, ([platform, count]) => ({
      axis: platform,
      value: (count / totalCount) * 100
    }));
    // Wrap axis/value pairs into the expected series shape
    return [{ name: 'Platforms', data: platformPercentages }];
  }, [data]);

  const usageVSAgeData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSAge = d3.rollup(data, v => d3.mean(v, d => d.Avg_Daily_Usage_Hours) || 0, d => d.Age);
    return Array.from(avgVSAge, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  const platformByMentalHealthData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const avgVSMentalHealth = d3.rollup(data, v => d3.mean(v, d => d.Mental_Health_Score)?.toFixed(2) || 0, d => d.Most_Used_Platform);
    return Array.from(avgVSMentalHealth, ([label, value]) => ({ label, value: Number(value) }));
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

  const academicImpactVSUsageData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSUsage = d3.rollup(data, v => {
      const affected = v.filter(d => d.Affects_Academic_Performance).length;
      return (affected / v.length) * 100; // Percentage
    }, d => Math.round(d.Avg_Daily_Usage_Hours));
    return Array.from(avgVSUsage, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  const academicLevelData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Academic_Level);
    return Array.from(counts, ([label, value]) => ({ label, value }));
  }, [data]);

  const avgUsageVSStudentLevelData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const avgVSLevel = d3.rollup(data, v => d3.mean(v, d => d.Avg_Daily_Usage_Hours)?.toFixed(2) || 0, d => d.Academic_Level);
    return Array.from(avgVSLevel, ([label, value]) => ({ label, value: Number(value) }));
  }, [data]);

  const academicImpactVSMentalHealthData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSMentalHealth = d3.rollup(data, v => {
      const affected = v.filter(d => d.Affects_Academic_Performance).length;
      return (affected / v.length) * 100; // Percentage
    }, d => Math.round(d.Mental_Health_Score));
    return Array.from(avgVSMentalHealth, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  // --- Mental Health Tab Data ---
  const mentalHealthVSUsageData = useMemo((): ScatterData[] => {
    if (data.length === 0) return [];
    return data.map(d => ({
      x: d.Avg_Daily_Usage_Hours,
      y: d.Mental_Health_Score
    }));
  }, [data]);

  const sleepVSUsageData = useMemo((): ScatterData[] => {
    if (data.length === 0) return [];
    return data.map(d => ({
      x: d.Avg_Daily_Usage_Hours,
      y: d.Sleep_Hours_Per_Night
    }));
  }, [data]);

  const avgMentalHealthVSAgeData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSAge = d3.rollup(data, v => d3.mean(v, d => d.Mental_Health_Score) || 0, d => d.Age);
    return Array.from(avgVSAge, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  const avgSleepVSAgeData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSAge = d3.rollup(data, v => d3.mean(v, d => d.Sleep_Hours_Per_Night) || 0, d => d.Age);
    return Array.from(avgVSAge, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  const avgMentalHealthVSSleepData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSSleep = d3.rollup(data, v => d3.mean(v, d => d.Mental_Health_Score) || 0, d => d.Sleep_Hours_Per_Night);
    return Array.from(avgVSSleep, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
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

  const conflictsVSRelationshipData = useMemo((): BoxPlotData[] => {
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
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab
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
                  <ChartContainer title="Geographic Distribution" icon1={<Globe size={18} />}>
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
                    <ChartContainer title="Most Used Platforms" icon1={<FaInstagram size={18} />}>
                      <div className="h-[400px]">
                        {/* <PieChart data={platformPieData} /> */}
                        <SpiderChart data={platformSpiderData} config={{
                          maxValue: 35,
                          levels: 5,
                          labelFactor: 1.2,
                          opacityArea: 0.5,
                          dotRadius: 6,
                          strokeWidth: 2,
                          roundStrokes: true,
                          margin: { top: 70, right: 70, bottom: 70, left: 70 }
                        }} />
                      </div>
                    </ChartContainer>
                  </div>
                  a pensar o que meter aqui (que caiba)


                  <div className="h-[480px] xl:col-span-2">
                    <ChartContainer title="Platform VS Mental Health" icon1={<FaInstagram size={18} />} icon2={<Brain size={18} />}>
                      <div className="h-[400px]">
                        <BarChart
                          data={platformByMentalHealthData}
                          xLabel="Platform"
                          yLabel="Avg Mental Health Score"
                        // colours={[
                        //   "#E1306C", // Instagram
                        //   "#1DA1F2", // Twitter
                        //   "#000000", // TikTok
                        //   "#FF0000", // YouTube
                        //   "#1877F2", // Facebook
                        //   "#0A66C2", // LinkedIn
                        //   "#FFFC00", // Snapchat
                        //   "#00C300", // LINE
                        //   "#FFEB00", // KakaoTalk
                        //   "#4A76A8", // VKontakte
                        //   "#25D366", // WhatsApp
                        //   "#07A119"  // WeChat
                        // ]}                     
                        />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px] xl:col-span-2">
                    <ChartContainer title="Usage Distribution VS Platform" icon1={<Clock size={18} />} icon2={<FaInstagram size={18} />}>
                      <div className="h-[400px]">
                        <BoxPlot data={usageBoxPlotData} yMax={yMax} />
                      </div>
                    </ChartContainer>
                  </div>

                </div>
              )}

              {activeTab === 'Academic Performance' && (
                /* Academic Performance Tab */
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  <div className="h-[480px]">
                    <ChartContainer title="Overall Academic Impact" icon1={<BookOpen size={18} />}>
                      <div className="h-[400px]">
                        <PieChart data={academicImpactData} />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Average Daily Usage VS Academic Level" icon1={<Clock size={18} />} icon2={<GraduationCap size={18} />}>
                      <div className="h-[400px]">
                        <BarChart data={avgUsageVSStudentLevelData} xLabel="Academic Level" yLabel="Number of Students" />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Negative Academic Impact VS Daily Usage" icon1={<ArrowDownRight size={18} />} icon2={<Clock size={18} />}>
                      <div className="h-[400px]">
                        <LineChart
                          data={academicImpactVSUsageData}
                          xLabel="Avg Daily Usage (hours)"
                          yLabel="% Negatively Affected"
                          color="#10b981"
                        />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Negative Academic Impact VS Mental Health Score" icon1={<ArrowDownRight size={18} />} icon2={<Brain size={18} />}>
                      <div className="h-[400px]">
                        <LineChart
                          data={academicImpactVSMentalHealthData}
                          xLabel="Mental Health Score"
                          yLabel="% Negatively Affected"
                          color="#f59e0b"
                        />
                      </div>
                    </ChartContainer>
                  </div>
                </div>
              )}

              {activeTab === 'Mental Health' && (
                /* Mental Health Tab */
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  <div className="h-[480px]">
                    <ChartContainer title="Mental Health VS Daily Usage" icon1={<Brain size={18} />} icon2={<Clock size={18} />}>
                      <div className="h-[400px]">
                        <ScatterGraph data={mentalHealthVSUsageData} xLabel="Social Media Daily Usage (hours)" yLabel="Mental Health Score" color="#8b5cf6" />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Mental Health Score VS Age" icon1={<Brain size={18} />} icon2={<Users size={18} />}>
                      <div className="h-[400px]">
                        <LineChart
                          data={avgMentalHealthVSAgeData}
                          xLabel="Age"
                          yLabel="Mental Health Score"
                          color="#14b8a6"
                        />
                      </div>
                    </ChartContainer>
                  </div>



                  <div className="h-[480px]">
                    <ChartContainer title="Sleep Hours VS Daily Usage" icon1={<Bed size={18} />} icon2={<Clock size={18} />}>
                      <div className="h-[400px]">
                        <ScatterGraph data={sleepVSUsageData} xLabel="Social Media Daily Usage (hours)" yLabel="Sleep Hours" color="#ec4899" />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Mental Health VS Sleep Hours" icon1={<Brain size={18} />} icon2={<Bed size={18} />}>
                      <div className="h-[400px]">
                        <LineChart
                          data={avgMentalHealthVSSleepData}
                          xLabel="Sleep Hours"
                          yLabel="Mental Health Score"
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
                    <ChartContainer title="Relationship Status" icon1={<Heart size={18} />}>
                      <div className="h-[400px]">
                        <DonutChart data={relationshipStatusData} centerText={`${data.length}`} />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Social Media Conflicts" icon1={<Angry size={18} />}>
                      <div className="h-[400px]">
                        <BarChart data={conflictsData} xLabel="Conflict Level" yLabel="Number of Students" />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px] xl:col-span-2">
                    <ChartContainer title="Conflicts VS Relationship Status" icon1={<Angry size={18} />} icon2={<Heart size={18} />}>
                      <div className="h-[400px]">
                        <BoxPlot data={conflictsVSRelationshipData} yMax={conflictsYMax} />
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