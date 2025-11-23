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
import SpiderChart from '../components/SpiderChart';
import WorldMap from "../components/WorldMap";

import FilterSidebar from "../components/FilterSideBar";

import { Clock, GraduationCap, Users, Heart, BookOpen, Angry, Brain, Bed, ArrowDownRight, Globe } from "lucide-react";
import { FaInstagram, FaTwitter, FaYoutube, FaFacebook, FaLinkedin, FaSnapchat, FaWhatsapp, FaWeixin, FaVk } from "react-icons/fa";
import { SiLine, SiKakaotalk } from "react-icons/si";
import tiktok from "../assets/tiktok.png";
import BubbleChart from "../components/BubbleChart";

const AnalyzeData: React.FC = () => {
  const [originalData, setOriginalData] = useState<StudentRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({});
  const [data, setData] = useState<StudentRecord[]>([]);

  // New State for Tabs
  const [activeTab, setActiveTab] = useState<string>('Demographics');

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



  const platformByMentalHealthData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const avgVSMentalHealth = d3.rollup(data, v => d3.mean(v, d => d.Mental_Health_Score)?.toFixed(2) || 0, d => d.Most_Used_Platform);
    return Array.from(avgVSMentalHealth, ([label, value]) => ({ label, value: Number(value) }))
      .sort((a, b) => b.value - a.value); // Sort high to low
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

  // Platform Personality Profiles
  const platformProfiles = useMemo(() => {
    if (data.length === 0) return [];

    // Determine fixed platform order based on originalData (unfiltered)
    const platformUsageCounts = d3.rollup(
      originalData,
      v => v.length,
      d => d.Most_Used_Platform
    );
    const topPlatformsByOriginal = Array.from(platformUsageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([platform,]) => platform);

    // Calculate stats from filtered data
    const platformStats = d3.rollup(
      data,
      v => ({
        addiction: d3.mean(v, d => d.Addicted_Score) || 0,
        sleepLoss: 8 - (d3.mean(v, d => d.Sleep_Hours_Per_Night) || 7),
        conflicts: d3.mean(v, d => d.Conflicts_Over_Social_Media) || 0,
        academicImpact: (v.filter(d => d.Affects_Academic_Performance).length / v.length) * 5,
        mentalDamage: 10 - (d3.mean(v, d => d.Mental_Health_Score) || 5)
      }),
      d => d.Most_Used_Platform
    );

    // Color palette to use for platform profiles
    const colors = ['#ec59a5ff', '#90d1d6ff', '#60a5fa', '#34d399'];

    // Return platforms in the fixed order, assigning colors from the palette
    return topPlatformsByOriginal.map((platform, idx) => {
      const stats = platformStats.get(platform) || {
        addiction: 0,
        sleepLoss: 0,
        conflicts: 0,
        academicImpact: 0,
        mentalDamage: 0
      };

      return {
        platform,
        data: [{
          name: platform,
          color: colors[idx % colors.length],
          data: [
            { axis: "Addiction", value: stats.addiction },
            { axis: "Sleep Loss", value: stats.sleepLoss },
            { axis: "Conflicts", value: stats.conflicts },
            { axis: "Academic Impact", value: stats.academicImpact },
            { axis: "Mental Damage", value: stats.mentalDamage }
          ]
        }]
      };
    });
  }, [data, originalData]);

  const platformUsageBubbleData = useMemo((): { id: string; value: number }[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Most_Used_Platform);
    return Array.from(counts, ([id, value]) => ({ id, value }));
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

    const platformUsageBarData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Most_Used_Platform);
    return Array.from(counts, ([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const avgMentalHealthVSSleepData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSSleep = d3.rollup(data, v => d3.mean(v, d => d.Mental_Health_Score) || 0, d => d.Sleep_Hours_Per_Night);
    return Array.from(avgVSSleep, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  // --- Conflicts & Relationships Tab Data ---
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

  const conflictsVSMentalHealthData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSMentalHealth = d3.rollup(data, v => d3.mean(v, d => d.Conflicts_Over_Social_Media) || 0, d => Math.round(d.Mental_Health_Score));
    return Array.from(avgVSMentalHealth, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  const conflictsVSDailyUsageData = useMemo((): LineChartData[] => {
    if (data.length === 0) return [];
    const avgVSDailyUsage = d3.rollup(data, v => d3.mean(v, d => d.Conflicts_Over_Social_Media) || 0, d => Math.round(d.Avg_Daily_Usage_Hours));
    return Array.from(avgVSDailyUsage, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [data]);

  // --- Demographics Tab Data ---
  const genderData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Gender);
    return Array.from(counts, ([label, value]) => ({ label, value }));
  }, [data]);

  const ageDistributionData = useMemo((): BarChartData[] => {
    if (data.length === 0) return [];
    const counts = d3.rollup(data, v => v.length, d => d.Age);
    return Array.from(counts, ([label, value]) => ({ label: String(label), value }))
      .sort((a, b) => Number(a.label) - Number(b.label));
  }, [data]);

  const yMax = useMemo(() => d3.max(data, d => d.Avg_Daily_Usage_Hours) || 0, [data]);
  const conflictsYMax = useMemo(() => d3.max(data, d => d.Conflicts_Over_Social_Media) || 0, [data]);

  const tabs = [
    'Demographics',
    'Geographics',
    'Mental Health',
    'Academic Performance',
    'Conflicts & Relationships',
    'Platform Usage',
    'Platform Profiles',
  ];

  const platformIcons: Record<string, React.ReactNode> = {
    "Instagram": <FaInstagram size={20} color="#E1306C" />,
    "Twitter": <FaTwitter size={20} color="#1DA1F2" />,
    "TikTok": <img src={tiktok} alt="TikTok" className="h-5 w-5" />,
    "YouTube": <FaYoutube size={20} color="#FF0000" />,
    "Facebook": <FaFacebook size={20} color="#1877F2" />,
    "LinkedIn": <FaLinkedin size={20} color="#0A66C2" />,
    "Snapchat": <FaSnapchat size={20} color="#FFFC00" />,
    "LINE": <SiLine size={20} color="#00C300" />,
    "KakaoTalk": <SiKakaotalk size={20} color="#FFEB00" />,
    "VKontakte": <FaVk size={20} color="#4A76A8" />,
    "WhatsApp": <FaWhatsapp size={20} color="#25D366" />,
    "WeChat": <FaWeixin size={20} color="#07A119" />
  };

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
              title={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 outline-none ${activeTab === tab
                ? 'bg-[#69b3a2] text-white shadow-xl shadow-[#69b3a2]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                } cursor-pointer transform hover:-translate-y-0.5 hover:scale-105`}
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

              {activeTab === 'Demographics' && (
                /* Demographics Tab */
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  <div className="h-[480px]">
                    <ChartContainer title="Gender Distribution" icon1={<Users size={18} />}>
                      <div className="h-[400px]">
                        <BarChart data={genderData} xLabel="Gender" yLabel="Number of Students" colours={['#2688a6ff', '#e4694eff']} />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Age Distribution" icon1={<Users size={18} />}>
                      <div className="h-[400px]">
                        <BarChart data={ageDistributionData} xLabel="Age" yLabel="Number of Students" />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Relationship Status" icon1={<Heart size={18} />}>
                      <div className="h-[400px]">
                        <DonutChart
                          data={relationshipStatusData}
                          centerText={`${data.length}`}
                          colorMap={{
                            'Complicated': '#8b5cf6',
                            'In Relationship': '#ec4899',
                            'Single': '#3b82f6'
                          }}
                        />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Academic Level Distribution" icon1={<GraduationCap size={18} />}>
                      <div className="h-[400px]">
                        <BarChart data={academicLevelData} xLabel="Academic Level" yLabel="Number of Students" colours={['#2688a6ff', '#2ca9b7ff', '#5bcfc9ff']} />
                      </div>
                    </ChartContainer>
                  </div>

                </div>
              )}

              {activeTab === 'Platform Usage' && (
                /* Platform Usage Tab */
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  {/* <div className="h-[480px] xl:col-span-2">
                    <ChartContainer title="Most Used Platforms" icon1={<FaInstagram size={18} />}>
                      <div className="h-[400px]">
                        <BarChart
                          data={platformUsageBarData}
                          orientation="horizontal"
                          xLabel="Number of Students"
                          yLabel="Platform"
                          iconMap={platformIcons}
                        />
                      </div>
                    </ChartContainer>
                  </div> */}

                  <div className="h-[490px]">
                    <ChartContainer title="Most Used Platforms" icon1={<FaInstagram size={18} />}>
                      <div className="h-[410px] flex flex-col">
                        {(() => {
                          const PlatformChartSwitcher: React.FC = () => {
                            const [mode, setMode] = useState<'bubble' | 'bar'>('bubble');
                            return (
                              <div className="h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                  <button
                                    type="button"
                                    onClick={() => setMode('bubble')}
                                    aria-pressed={mode === 'bubble'}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${mode === 'bubble'
                                      ? 'bg-[#69b3a2] text-white shadow'
                                      : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                                  >
                                    Bubble Chart
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMode('bar')}
                                    aria-pressed={mode === 'bar'}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${mode === 'bar'
                                      ? 'bg-[#69b3a2] text-white shadow'
                                      : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                                  >
                                    Bar Chart
                                  </button>
                                </div>

                                <div className="flex-1 min-h-0">
                                  {mode === 'bubble' ? (
                                    <div className="h-full">
                                      <BubbleChart data={platformUsageBubbleData} height={400} iconMap={platformIcons} />
                                    </div>
                                  ) : (
                                    <div className="h-full">
                                      <BarChart
                                        data={platformUsageBarData}
                                        orientation="horizontal"
                                        xLabel="Number of Students"
                                        yLabel="Platform"
                                        iconMap={platformIcons}
                                        isSocialMedia={true}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          };

                          return <PlatformChartSwitcher />;
                        })()}
                      </div>
                    </ChartContainer>
                  </div>


                  <div className="h-[490px]">
                    <ChartContainer title="Platform VS Mental Health" icon1={<FaInstagram size={18} />} icon2={<Brain size={18} />}>
                      <div className="h-[410px]">
                        <BarChart
                          data={platformByMentalHealthData}
                          orientation="horizontal"
                          yLabel="Platform"
                          xLabel="Avg Mental Health Score"
                          iconMap={platformIcons}
                          isSocialMedia={true}
                        />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px] xl:col-span-2">
                    <ChartContainer title="Usage Distribution VS Platform" icon1={<Clock size={18} />} icon2={<FaInstagram size={18} />}>
                      <div className="h-[410px]">
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
                        <PieChart data={academicImpactData} colours={['#f76868ff', '#10b981']} />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Average Daily Usage VS Academic Level" icon1={<Clock size={18} />} icon2={<GraduationCap size={18} />}>
                      <div className="h-[400px]">
                        <BarChart data={avgUsageVSStudentLevelData} xLabel="Academic Level" yLabel="Avg Daily Usage (hours)" colours={['#2688a6ff', '#2ca9b7ff', '#5bcfc9ff']} />
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

              {activeTab === 'Platform Profiles' && (
                /* Platform Profiles Tab */
                <div>
                  <div className="bg-gray-900 border border-gray-700 shadow-lg rounded-lg p-6 relative mb-2">
                    <h2 className="text-3xl font-bold mb-3 text-teal-300 inline-flex gap-2"><Users size={32} />Platform Personality Profiles</h2>
                    <p className="text-gray-400 text-sm mt-2"><b>Higher values =</b> More problematic in that area</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platformProfiles.map(({ platform, data: profileData }) => (
                      <div key={platform} className="h-[420px]">
                        <ChartContainer title={platform} icon1={platformIcons[platform] as React.ReactElement}>
                          <div className="h-[340px]">
                            <SpiderChart data={profileData} config={{ levels: 5, maxValue: 5 }} />
                          </div>
                        </ChartContainer>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Conflicts & Relationships' && (
                /* Relationships Tab */
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  <div className="h-[480px] ">
                    <ChartContainer title="Social Media Conflicts" icon1={<Angry size={18} />}>
                      <div className="h-[400px]">
                        <BarChart data={conflictsData} xLabel="Number of Conflicts" yLabel="Number of Students" />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px] ">
                    <ChartContainer title="Conflicts VS Relationship Status" icon1={<Angry size={18} />} icon2={<Heart size={18} />}>
                      <div className="h-[400px]">
                        <BoxPlot data={conflictsVSRelationshipData} yMax={conflictsYMax} yLabel="Number of Conflicts" />
                      </div>
                    </ChartContainer>
                  </div>
                  <div className="h-[480px]">
                    <ChartContainer title="Conflicts VS Mental Health" icon1={<Angry size={18} />} icon2={<Brain size={18} />}>
                      <div className="h-[400px]">
                        <LineChart data={conflictsVSMentalHealthData} xLabel="Mental Health Score" yLabel="Number of Conflicts" />
                      </div>
                    </ChartContainer>
                  </div>

                  <div className="h-[480px]">
                    <ChartContainer title="Conflicts VS Daily Usage" icon1={<Angry size={18} />} icon2={<Clock size={18} />}>
                      <div className="h-[400px]">
                        <LineChart data={conflictsVSDailyUsageData} xLabel="Daily Usage (hours)" yLabel="Number of Conflicts" color="orange" />
                      </div>
                    </ChartContainer>
                  </div>

                </div>
              )}

              {activeTab === 'Geographics' && (
                /* Geographic Tab - Full Height Map */
                <div className="h-[calc(100vh-12rem)]">
                  <ChartContainer title="Geographic Distribution" icon1={<Globe size={18} />}>
                    <div className="h-full">
                      <WorldMap studentData={data} />
                    </div>
                  </ChartContainer>
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