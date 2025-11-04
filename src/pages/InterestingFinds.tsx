import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { loadStudentData, generateInsights, StudentRecord, Insights } from "../data/data";

const InterestingFinds: React.FC = () => {
  const [data, setData] = useState<StudentRecord[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    loadStudentData("/data/dataset.csv").then((parsed: StudentRecord[]) => {
      setData(parsed);
      setInsights(generateInsights(parsed));
    });
  }, []);

  if (!data.length || !insights) {
    return <p className="p-6 text-gray-500">Loading insights...</p>;
  }

  const width = 500;
  const height = 350;
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };

  const renderAxis = (xScale: any, yScale: any, xLabel: string, yLabel: string, xType: 'band' | 'linear' = 'linear') => {
    const xAxis = xType === 'band' 
      ? d3.axisBottom(xScale)
      : d3.axisBottom(xScale).ticks(5);
    
    const yAxis = d3.axisLeft(yScale).ticks(5);

    return (
      <>
        <g
          transform={`translate(0, ${height - margin.bottom})`}
          ref={node => { if (node) d3.select(node).call(xAxis as any); }}
          fontSize={12}
        />
        <g
          transform={`translate(${margin.left}, 0)`}
          ref={node => { if (node) d3.select(node).call(yAxis as any); }}
          fontSize={12}
        />
        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize={13} fill="#666" fontWeight="500">
          {xLabel}
        </text>
        <text transform={`rotate(-90) translate(-${height / 2}, 20)`} textAnchor="middle" fontSize={13} fill="#666" fontWeight="500">
          {yLabel}
        </text>
      </>
    );
  };

  // Prepare chart data
  const genderData = Array.from(insights.genderSplit.entries());
  const genderXScale = d3.scaleBand().domain(genderData.map(d => d[0])).range([margin.left, width - margin.right]).padding(0.3);
  const genderYScale = d3.scaleLinear().domain([0, d3.max(genderData.map(d => d[1])) ?? 0]).nice().range([height - margin.bottom, margin.top]);

  const platformData = Array.from(insights.platformDistribution.entries()).sort((a, b) => b[1] - a[1]);
  const platformXScale = d3.scaleBand().domain(platformData.map(d => d[0])).range([margin.left, width - margin.right]).padding(0.3);
  const platformYScale = d3.scaleLinear().domain([0, d3.max(platformData.map(d => d[1])) ?? 0]).nice().range([height - margin.bottom, margin.top]);

  const ageData = Array.from(insights.usageByAge.entries()).sort((a, b) => a[0] - b[0]);
  const ageXScale = d3.scaleLinear().domain(d3.extent(ageData.map(d => d[0])) as [number, number]).range([margin.left, width - margin.right]);
  const ageYScale = d3.scaleLinear().domain([0, d3.max(ageData.map(d => d[1])) ?? 0]).nice().range([height - margin.bottom, margin.top]);
  const ageLine = d3.line<[number, number]>().x(d => ageXScale(d[0])).y(d => ageYScale(d[1]));

  const mentalHealthXScale = d3.scaleLinear().domain(d3.extent(insights.mentalHealthByUsage.map(d => d.usage)) as [number, number]).range([margin.left, width - margin.right]);
  const mentalHealthYScale = d3.scaleLinear().domain(d3.extent(insights.mentalHealthByUsage.map(d => d.mentalHealth)) as [number, number]).range([height - margin.bottom, margin.top]);

  const academicPie = d3.pie<{key: string, value: number}>().value(d => d.value);
  const academicData = [
    {key: 'Yes', value: insights.academicImpact.yes},
    {key: 'No', value: insights.academicImpact.no}
  ];
  const academicArc: any = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 3);

  const sleepXScale = d3.scaleLinear().domain(d3.extent(insights.sleepVsAddiction.map(d => d.sleep)) as [number, number]).range([margin.left, width - margin.right]);
  const sleepYScale = d3.scaleLinear().domain(d3.extent(insights.sleepVsAddiction.map(d => d.addiction)) as [number, number]).range([height - margin.bottom, margin.top]);

  const relationshipData = Array.from(insights.relationshipStats.entries());
  const relationshipXScale = d3.scaleBand().domain(relationshipData.map(d => d[0])).range([margin.left, width - margin.right]).padding(0.3);
  const relationshipYScale = d3.scaleLinear().domain([0, d3.max(relationshipData.map(d => d[1])) ?? 0]).nice().range([height - margin.bottom, margin.top]);

  const ageDistData = Array.from(insights.ageDistribution.entries()).sort((a, b) => a[0] - b[0]);
  const ageDistXScale = d3.scaleBand().domain(ageDistData.map(d => d[0].toString())).range([margin.left, width - margin.right]).padding(0.3);
  const ageDistYScale = d3.scaleLinear().domain([0, d3.max(ageDistData.map(d => d[1])) ?? 0]).nice().range([height - margin.bottom, margin.top]);

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">📊 Comprehensive Social Media Usage Analysis</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">Avg Daily Usage</div>
          <div className="text-2xl font-bold text-blue-800">{insights.avgUsage.toFixed(2)}h</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">Avg Sleep</div>
          <div className="text-2xl font-bold text-green-800">{insights.avgSleep.toFixed(1)}h</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600">Mental Health</div>
          <div className="text-2xl font-bold text-purple-800">{insights.avgMentalHealth.toFixed(1)}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600">Top Platform</div>
          <div className="text-2xl font-bold text-orange-800">{insights.topPlatform}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600">Addiction/Sleep</div>
          <div className="text-2xl font-bold text-red-800">{insights.addictionVsSleep.toFixed(2)}</div>
        </div>
      </div>

{/* Charts Grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

  {/* Gender Distribution */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-blue-600">👥 Gender Distribution</h3>
    <svg width={width} height={height} className="mx-auto">
      {genderData.map(([gender, count]) => (
        <g key={gender}>
          <rect
            x={genderXScale(gender)!}
            y={genderYScale(count)}
            width={genderXScale.bandwidth()}
            height={genderYScale(0) - genderYScale(count)}
            fill="#3b82f6"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          <text
            x={genderXScale(gender)! + genderXScale.bandwidth() / 2}
            y={genderYScale(count) - 8}
            textAnchor="middle"
            fontSize={13}
            fill="#333"
            fontWeight="bold"
          >
            {count}
          </text>
        </g>
      ))}
      {renderAxis(genderXScale, genderYScale, "Gender", "Count", "band")}
    </svg>
  </div>

  {/* Platform Distribution */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-green-600">📱 Platform Popularity</h3>
    <svg width={width} height={height} className="mx-auto">
      {platformData.map(([platform, count]) => (
        <g key={platform}>
          <rect
            x={platformXScale(platform)!}
            y={platformYScale(count)}
            width={platformXScale.bandwidth()}
            height={platformYScale(0) - platformYScale(count)}
            fill="#10b981"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          <text
            x={platformXScale(platform)! + platformXScale.bandwidth() / 2}
            y={platformYScale(count) - 8}
            textAnchor="middle"
            fontSize={12}
            fill="#333"
            fontWeight="bold"
          >
            {count}
          </text>
        </g>
      ))}
      {renderAxis(platformXScale, platformYScale, "Platform", "Users", "band")}
    </svg>
  </div>

  {/* Usage by Age */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-purple-600">📈 Usage by Age</h3>
    <svg width={width} height={height} className="mx-auto">
      <path
        d={ageLine(ageData) || ""}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={3}
      />
      {ageData.map(([age, usage]) => (
        <circle
          key={age}
          cx={ageXScale(age)}
          cy={ageYScale(usage)}
          r={6}
          fill="#8b5cf6"
          stroke="#fff"
          strokeWidth={2}
        />
      ))}
      {renderAxis(ageXScale, ageYScale, "Age", "Avg Usage (hours)")}
      <text x={width - margin.right} y={margin.top} textAnchor="end" fontSize={13} fill="#666" fontWeight="bold">
        Trend Line
      </text>
    </svg>
  </div>

  {/* Mental Health vs Usage */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-red-600">🧠 Mental Health vs Usage</h3>
    <svg width={width} height={height} className="mx-auto">
      {insights.mentalHealthByUsage.map((d, i) => (
        <circle
          key={i}
          cx={mentalHealthXScale(d.usage)}
          cy={mentalHealthYScale(d.mentalHealth)}
          r={5}
          fill="#ef4444"
          opacity={0.7}
          className="hover:r-7 transition-all"
        />
      ))}
      {renderAxis(mentalHealthXScale, mentalHealthYScale, "Daily Usage (hours)", "Mental Health Score")}
      <text x={width - margin.right} y={margin.top} textAnchor="end" fontSize={13} fill="#666">
        Each dot = 1 student
      </text>
    </svg>
  </div>

  {/* Academic Impact */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-orange-600">🎓 Academic Impact</h3>
    <svg width={width} height={height} className="mx-auto">
      <g transform={`translate(${width/2}, ${height/2})`}>
        {academicPie(academicData).map((slice, i) => (
          <g key={i}>
            <path
              d={academicArc(slice)}
              fill={i === 0 ? "#f59e0b" : "#6b7280"}
            />
            <text
              transform={`translate(${academicArc.centroid(slice)})`}
              textAnchor="middle"
              fontSize={13}
              fill="white"
              fontWeight="bold"
            >
              {academicData[i].value}
            </text>
          </g>
        ))}
      </g>
      <text x={width/2} y={height - 20} textAnchor="middle" fontSize={14} fill="#333" fontWeight="500">
        Total: {data.length} students
      </text>
    </svg>
  </div>

  {/* Sleep vs Addiction */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-indigo-600">😴 Sleep vs Addiction</h3>
    <svg width={width} height={height} className="mx-auto">
      {insights.sleepVsAddiction.map((d, i) => (
        <circle
          key={i}
          cx={sleepXScale(d.sleep)}
          cy={sleepYScale(d.addiction)}
          r={5}
          fill="#6366f1"
          opacity={0.7}
          className="hover:r-7 transition-all"
        />
      ))}
      {renderAxis(sleepXScale, sleepYScale, "Sleep Hours/Night", "Addiction Score")}
      <text x={width - margin.right} y={margin.top} textAnchor="end" fontSize={13} fill="#666" fontWeight="500">
        Correlation Analysis
      </text>
    </svg>
  </div>

  {/* Relationship Status */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-pink-600">💕 Relationship Status</h3>
    <svg width={width} height={height} className="mx-auto">
      {relationshipData.map(([status, count]) => (
        <g key={status}>
          <rect
            x={relationshipXScale(status)!}
            y={relationshipYScale(count)}
            width={relationshipXScale.bandwidth()}
            height={relationshipYScale(0) - relationshipYScale(count)}
            fill="#ec4899"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          <text
            x={relationshipXScale(status)! + relationshipXScale.bandwidth() / 2}
            y={relationshipYScale(count) - 8}
            textAnchor="middle"
            fontSize={12}
            fill="#333"
            fontWeight="bold"
          >
            {count}
          </text>
        </g>
      ))}
      {renderAxis(relationshipXScale, relationshipYScale, "Relationship Status", "Count", "band")}
    </svg>
  </div>

  {/* Age Distribution */}
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-cyan-600">👥 Age Distribution</h3>
    <svg width={width} height={height} className="mx-auto">
      {ageDistData.map(([age, count]) => (
        <g key={age}>
          <rect
            x={ageDistXScale(age.toString())!}
            y={ageDistYScale(count)}
            width={ageDistXScale.bandwidth()}
            height={ageDistYScale(0) - ageDistYScale(count)}
            fill="#06b6d4"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          <text
            x={ageDistXScale(age.toString())! + ageDistXScale.bandwidth() / 2}
            y={ageDistYScale(count) - 8}
            textAnchor="middle"
            fontSize={12}
            fill="#333"
            fontWeight="bold"
          >
            {count}
          </text>
        </g>
      ))}
      {renderAxis(ageDistXScale, ageDistYScale, "Age", "Count", "band")}
    </svg>
  </div>

</div>


      {/* Additional Insights */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">📋 Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-3 text-lg">Usage Patterns</h4>
            <ul className="space-y-2">
              <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Average daily social media usage: <b className="ml-1">{insights.avgUsage.toFixed(2)} hours</b></li>
              <li className="flex items-start"><span className="text-green-500 mr-2">•</span>Most popular platform: <b className="ml-1">{insights.topPlatform}</b></li>
              <li className="flex items-start"><span className="text-purple-500 mr-2">•</span>Peak usage age: <b className="ml-1">{Array.from(insights.usageByAge.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]} years old</b></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-lg">Health & Well-being</h4>
            <ul className="space-y-2">
              <li className="flex items-start"><span className="text-orange-500 mr-2">•</span>{((insights.academicImpact.yes / data.length) * 100).toFixed(1)}% report academic impact</li>
              <li className="flex items-start"><span className="text-red-500 mr-2">•</span>Average mental health score: <b className="ml-1">{insights.avgMentalHealth.toFixed(1)}/10</b></li>
              <li className="flex items-start"><span className="text-indigo-500 mr-2">•</span>Average sleep duration: <b className="ml-1">{insights.avgSleep.toFixed(1)} hours/night</b></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestingFinds;
