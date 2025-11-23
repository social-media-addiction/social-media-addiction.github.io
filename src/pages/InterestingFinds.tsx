import React, { useEffect, useState, useMemo } from "react";

import { loadStudentData, generateInsights, StudentRecord, Insights } from "../data/data";
import Aurora from "../components/Aurora";
import ChartContainer from "../components/ChartContainer";
import BarChart, { BarChartData } from "../components/BarChart";
import PieChart, { PieChartData } from "../components/PieChart";
import LineChart, { LineChartData } from "../components/LineChart";
import ScatterGraph, { ScatterData } from "../components/ScatterGraph";
import { Brain, Clock, BookOpen, Bed, Zap, Activity, TrendingUp } from "lucide-react";
import { FaInstagram, FaTwitter, FaYoutube, FaFacebook, FaLinkedin, FaSnapchat, FaWhatsapp, FaWeixin, FaVk } from "react-icons/fa";
import { SiLine, SiKakaotalk } from "react-icons/si";
import tiktok from "../assets/tiktok.png";

const InterestingFinds: React.FC = () => {
  const [data, setData] = useState<StudentRecord[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    loadStudentData("/data/dataset.csv").then((parsed: StudentRecord[]) => {
      setData(parsed);
      setInsights(generateInsights(parsed));
    });
  }, []);

  // --- Data Preparation for Reusable Components ---

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


  const platformChartData = useMemo((): BarChartData[] => {
    if (!insights) return [];
    return Array.from(insights.platformDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [insights]);

  const ageUsageChartData = useMemo((): LineChartData[] => {
    if (!insights) return [];
    return Array.from(insights.usageByAge.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([age, usage]) => ({ x: age, y: usage }));
  }, [insights]);

  const mentalHealthUsageData = useMemo((): ScatterData[] => {
    if (!insights) return [];
    return insights.mentalHealthByUsage.map(d => ({ x: d.usage, y: d.mentalHealth }));
  }, [insights]);

  const academicPieData = useMemo((): PieChartData[] => {
    if (!insights) return [];
    return [
      { label: 'Affected', value: insights.academicImpact.yes },
      { label: 'Not Affected', value: insights.academicImpact.no }
    ];
  }, [insights]);

  const sleepAddictionData = useMemo((): ScatterData[] => {
    if (!insights) return [];
    return insights.sleepVsAddiction.map(d => ({ x: d.sleep, y: d.addiction }));
  }, [insights]);





  if (!data.length || !insights) {
    return (
      <div className="relative min-h-screen pt-20 text-white bg-gradient-to-b from-[#1a0d26] via-[#2a1a3a] to-[#1a0d26] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-[#69b3a2] border-white/10 rounded-full animate-spin"></div>
          <p className="text-gray-300 font-medium">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 text-white bg-gradient-to-b from-[#1a0d26] via-[#2a1a3a] to-[#1a0d26] overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora blend={0.5} amplitude={1.2} speed={0.5} />
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-12">

        {/* Header */}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <MetricCard
            title="Avg Daily Usage"
            value={`${insights.avgUsage.toFixed(2)}h`}
            icon={<Clock className="text-teal-400" size={20} />}
          />
          <MetricCard
            title="Peak Usage Age"
            value={`${Array.from(insights.usageByAge.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]} yrs`}
            icon={<TrendingUp className="text-green-400" size={20} />}
          />
          <MetricCard
            title="Avg Sleep"
            value={`${insights.avgSleep.toFixed(1)}h`}
            icon={<Bed className="text-indigo-400" size={20} />}
          />
          <MetricCard
            title="Avg Mental Health"
            value={
              <span className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{insights.avgMentalHealth.toFixed(1)}</span>
                <span className="text-sm text-gray-400">/10</span>
              </span>
            }
            icon={<Brain className="text-pink-400" size={20} />}
          />
          <MetricCard
            title="Top Platform"
            value={insights.topPlatform}
            icon={<FaInstagram className="text-orange-400" size={20} />}
          />
          <MetricCard
            title="Addiction/Sleep"
            value={insights.addictionVsSleep.toFixed(3)}
            icon={<Activity className="text-yellow-400" size={20} />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

          {/* Row 1 */}


          <ChartContainer title="Platform Popularity" icon1={<Zap size={18} />}>
            <div className="h-[300px]">
              <BarChart
                data={platformChartData}
                orientation="horizontal"
                xLabel="Users"
                yLabel="Platform"
                iconMap={platformIcons}
              />
            </div>
          </ChartContainer>

          <ChartContainer title="Usage by Age Trend" icon1={<TrendingUp size={18} />}>
            <div className="h-[300px]">
              <LineChart data={ageUsageChartData} xLabel="Age" yLabel="Avg Usage (hours)" color="#8b5cf6" />
            </div>
          </ChartContainer>

          {/* Row 2 */}
          <ChartContainer title="Academic Impact" icon1={<BookOpen size={18} />}>
            <div className="h-[300px]">
              <PieChart data={academicPieData} colours={ ['#e25b5bff', '#10b981'] } />
            </div>
          </ChartContainer>

          {/* Row 2 */}
          <div className="lg:col-span-2">
            <ChartContainer title="Mental Health vs Daily Usage" icon1={<Brain size={18} />} icon2={<Clock size={18} />}>
              <div className="h-[350px]">
                <ScatterGraph data={mentalHealthUsageData} xLabel="Daily Usage (hours)" yLabel="Mental Health Score" color="#ef4444" />
              </div>
            </ChartContainer>
          </div>

          {/* Row 3 */}
          <ChartContainer title="Sleep vs Addiction" icon1={<Bed size={18} />} icon2={<Activity size={18} />}>
            <div className="h-[300px]">
              <ScatterGraph data={sleepAddictionData} xLabel="Sleep (hours)" yLabel="Addiction Score" color="#6366f1" />
            </div>
          </ChartContainer>





        </div>

        {/* Key Insights Section */}
        {/* <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Key Takeaways
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-teal-200 border-b border-white/10 pb-2">Usage Patterns</h3>
              <ul className="space-y-3">
                <InsightItem label="Avg Daily Usage" value={`${insights.avgUsage.toFixed(2)} hours`} color="bg-blue-500" />
                <InsightItem label="Top Platform" value={insights.topPlatform} color="bg-green-500" />
                <InsightItem label="Peak Usage Age" value={`${Array.from(insights.usageByAge.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]} years old`} color="bg-purple-500" />
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-pink-200 border-b border-white/10 pb-2">Health & Well-being</h3>
              <ul className="space-y-3">
                <InsightItem label="Academic Impact" value={`${((insights.academicImpact.yes / data.length) * 100).toFixed(1)}% affected`} color="bg-orange-500" />
                <InsightItem label="Avg Mental Health" value={`${insights.avgMentalHealth.toFixed(1)}/5`} color="bg-red-500" />
                <InsightItem label="Avg Sleep" value={`${insights.avgSleep.toFixed(1)} hours`} color="bg-indigo-500" />
              </ul>
            </div>
          </div>
        </div> */}

      </div>
    </div>
  );
};

// Helper Components for cleaner code
const MetricCard = ({ title, value, icon, trend, trendUp }: { title: string, value: React.ReactNode, icon: React.ReactNode, trend?: string, trendUp?: boolean }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-gray-400 text-sm font-medium">{title}</span>
      <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    {trend && (
      <div className={`text-xs flex items-center gap-1 ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    )}
  </div>
);

const InsightItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <li className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full ${color}`}></span>
      <span className="text-gray-300">{label}</span>
    </div>
    <span className="font-bold text-white">{value}</span>
  </li>
);

export default InterestingFinds;