import React, { useEffect, useState, useMemo } from "react";
import * as d3 from 'd3';
import { loadStudentData, StudentRecord, filterData, FilterCriteria } from "../data/data";
import Aurora from "../components/Aurora";
import BoxPlot, { BoxPlotData } from '../components/BoxPlot';
import ChartContainer from '../components/ChartContainer';
import BarChart, { BarChartData } from '../components/BarChart';
<<<<<<< HEAD
import WorldMap from "../components/WorldMap";
=======
import MultiSelectDropdown from "../components/MultiSelectDropdown";
>>>>>>> 08a4b56 (adding filters and filter func to data.ts)

const AnalyzeData: React.FC = () => {
  const [originalData, setOriginalData] = useState<StudentRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({});
  const [data, setData] = useState<StudentRecord[]>([]); // This will now hold the filtered data

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

  const filterableProperties: (keyof StudentRecord)[] = [
    'Gender',
    'Academic_Level',
    'Most_Used_Platform',
    'Relationship_Status',
    'Country',
  ];

  const uniqueFilterValues = useMemo(() => {
    const values: { [key: string]: Set<string | number | boolean> } = {};
    filterableProperties.forEach(prop => {
      values[prop as string] = new Set(originalData.map(d => d[prop]));
    });
    return values;
  }, [originalData, filterableProperties]);

  const handleFilterChange = (property: keyof StudentRecord, selectedValues: (string | number | boolean)[]) => {
    setActiveFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      if (selectedValues.length > 0) {
        newFilters[property] = selectedValues;
      } else {
        delete newFilters[property];
      }
      return newFilters;
    });
  };

  const handleClearFilter = (property: keyof StudentRecord) => {
    setActiveFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      delete newFilters[property];
      return newFilters;
    });
  };

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
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {filterableProperties.map(prop => (
            <MultiSelectDropdown
              key={prop}
              label={prop.replace(/_/g, ' ')}
              options={Array.from(uniqueFilterValues[prop as string] || [])}
              selectedValues={Array.isArray(activeFilters[prop]) ? (activeFilters[prop] as (string | number | boolean)[]) : []}
              onChange={(selected) => handleFilterChange(prop, selected)}
              onClear={() => handleClearFilter(prop)}
            />
          ))}
        </div>
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
        <ChartContainer title="Metric by Demographics (Country Map)" className="mt-8 mx-auto">
          <WorldMap
            studentData={data}
          />
        </ChartContainer>
      </div>
    </div>
  );
};

export default AnalyzeData;