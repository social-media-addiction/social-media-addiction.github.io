import { motion, AnimatePresence } from "framer-motion";
import { ReactElement, useState, useEffect, useMemo } from "react";
import { Brain, Users, GraduationCap, Search, Globe, Clock4, BookOpen, Clock, ArrowLeft } from "lucide-react";
import ChartContainer from "../components/ChartContainer";
import LineChart, { LineChartData } from "../components/LineChart";
import ScatterGraph, { ScatterData } from '../components/ScatterGraph';
import bgVideo from "../assets/videos/bg-small.mp4";
import BarChart, { BarChartData } from '../components/BarChart';

import WorldMap from '../components/WorldMap';
import { StudentRecord, loadStudentData } from "../data/data";
import * as d3 from 'd3';
import RangeSlider from "../components/RangeSlider";

interface Hotspot {
  id: string;
  x: string;
  y: string;
  icon: ReactElement;
  label: string;
  info: string;
}

const hotspots: Hotspot[] = [
  {
    id: "academic",
    x: "24%",
    y: "60%",
    icon: <GraduationCap size={40} color="#59cccaff" />,
    label: "Academic Performance",
    info:
      "Studies show that excessive social media use can reduce focus and GPA among students. Maintaining digital balance helps improve productivity and academic outcomes.",
  },
  {
    id: "relationships",
    x: "48.5%",
    y: "51%",
    icon: <Users size={28} color="#59cccaff" />,
    label: "Conflicts & Relationships",
    info:
      "Social media can connect people but may also cause tension and comparison. Healthy online boundaries strengthen real-world relationships.",
  },
  {
    id: "mental-health",
    x: "46%",
    y: "72%",
    icon: <Brain size={28} color="#59cccaff" />,
    label: "Mental Health",
    info:
      "Prolonged screen time has been linked to anxiety and sleep issues. Limiting usage and mindful scrolling can support better mental well-being.",
  },

  {
    id: "geographics",
    x: "88%",
    y: "40%",
    icon: <Globe size={28} color="#59cccaff" />,
    label: "Geographics",
    info:
      "Geographical data reveals how social media usage varies across different regions, highlighting cultural and regional trends.",
  }
];

export default function ExploreRoom() {
  const [zoomedSpot, setZoomedSpot] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [data, setData] = useState<StudentRecord[]>([]);
  const [filters, setFilters] = useState({
    gender: 'All',
    ageRange: 'All',
    academicLevel: 'All'
  });
  const [conflictMetric, setConflictMetric] = useState<'Mental Health' | 'Daily Usage'>('Mental Health');
  const [academicMetric, setAcademicMetric] = useState<'Daily Usage' | 'Mental Health'>('Daily Usage');
  const [mentalHealthMetric, setMentalHealthMetric] = useState<'Mental Health' | 'Sleep Hours'>('Mental Health');

  useEffect(() => {
    loadStudentData('/data/dataset.csv').then(setData);
  }, []);

  // Derived age bounds for the RangeSlider and a handler for changes
  const ageBounds = useMemo(() => {
    if (data.length === 0) {
      return { min: 18, max: 24, rangeMin: 18, rangeMax: 24 };
    }
    const ages = data.map(d => d.Age);
    const min = Math.min(...ages);
    const max = Math.max(...ages);
    return { min, max, rangeMin: min, rangeMax: max };
  }, [data]);

  const prop = "age-slider";
  const label = "Age Range";
  const handleAgeRangeChange = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, ageRange: `${min}-${max}` }));
  };

  // Wait for zoom animation to complete before showing info card
  useEffect(() => {
    if (zoomedSpot) {
      const timer = setTimeout(() => setShowInfo(true), 900); // slight delay
      return () => clearTimeout(timer);
    } else {
      setShowInfo(false);
    }
  }, [zoomedSpot]);

  const selectedSpot = hotspots.find((s) => s.id === zoomedSpot);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (filters.gender !== 'All' && d.Gender !== filters.gender) return false;
      if (filters.academicLevel !== 'All' && d.Academic_Level !== filters.academicLevel) return false;
      if (filters.ageRange !== 'All') {
        const age = d.Age;
        // Parse the age range string like "18-24"
        const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
        if (age < minAge || age > maxAge) return false;
      }
      return true;
    });
  }, [data, filters]);

  // Chart Data Preparations
  const academicData = useMemo((): BarChartData[] => {
    if (filteredData.length === 0) return [];
    // Compare Avg Usage for those who say it affects performance vs those who don't
    const counts = d3.rollup(filteredData, v => d3.mean(v, d => d.Avg_Daily_Usage_Hours) || 0, d => d.Affects_Academic_Performance ? "Yes" : "No");
    return Array.from(counts, ([key, value]) => ({ label: key, value }));
  }, [filteredData]);

  // New: Negative Academic Impact vs Daily Usage
  const negativeImpactVsDailyUsageData = useMemo((): LineChartData[] => {
    if (filteredData.length === 0) return [];
    // Group by rounded daily usage hours and compute proportion of negative impact (Affects_Academic_Performance true)
    const grouped = d3.rollup(
      filteredData,
      v => d3.mean(v, d => d.Affects_Academic_Performance ? 1 : 0) || 0,
      d => Math.round(d.Avg_Daily_Usage_Hours)
    );
    return Array.from(grouped, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [filteredData]);

  const negativeImpactVsMentalHealthData = useMemo((): LineChartData[] => {
    if (filteredData.length === 0) return [];
    // Group by mental health score and compute proportion of negative impact
    const grouped = d3.rollup(
      filteredData,
      v => d3.mean(v, d => d.Affects_Academic_Performance ? 1 : 0) || 0,
      d => d.Mental_Health_Score
    );
    return Array.from(grouped, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [filteredData]);

  const relationshipsData = useMemo((): BarChartData[] => {
    if (filteredData.length === 0) return [];
    // Avg Conflicts by Relationship Status
    const counts = d3.rollup(filteredData, v => d3.mean(v, d => d.Conflicts_Over_Social_Media) || 0, d => d.Relationship_Status);
    return Array.from(counts, ([key, value]) => ({ label: String(key), value }));
  }, [filteredData]);

  const conflictsVsMentalHealthData = useMemo((): LineChartData[] => {
    if (filteredData.length === 0) return [];
    const avgVSMentalHealth = d3.rollup(filteredData, v => d3.mean(v, d => d.Conflicts_Over_Social_Media) || 0, d => d.Mental_Health_Score);
    return Array.from(avgVSMentalHealth, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [filteredData]);

  const conflictsVsDailyUsageData = useMemo((): LineChartData[] => {
    if (filteredData.length === 0) return [];
    const avgVSDailyUsage = d3.rollup(filteredData, v => d3.mean(v, d => d.Conflicts_Over_Social_Media) || 0, d => Math.round(d.Avg_Daily_Usage_Hours));
    return Array.from(avgVSDailyUsage, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [filteredData]);

  const mentalHealthVsUsageData = useMemo((): ScatterData[] => {
    if (filteredData.length === 0) return [];
    return filteredData.map(d => ({
      x: d.Avg_Daily_Usage_Hours,
      y: d.Mental_Health_Score
    }));
  }, [filteredData]);

  const sleepVsUsageData = useMemo((): ScatterData[] => {
    if (filteredData.length === 0) return [];
    return filteredData.map(d => ({
      x: d.Avg_Daily_Usage_Hours,
      y: d.Sleep_Hours_Per_Night
    }));
  }, [filteredData]);


  

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background video */}
      <motion.video
        key={zoomedSpot}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        animate={{
          scale: zoomedSpot ? 2.2 : 1,
          opacity: zoomedSpot ? 0.9 : 1,
          x:
            zoomedSpot === "academic"
              ? "48%"
              : zoomedSpot === "relationships"
                ? "0%"
                : zoomedSpot === "mental-health"
                  ? "0%"
                  : zoomedSpot === "geographics"
                    ? "-60%"
                : "0%",
          y:
            zoomedSpot === "academic"
              ? "-35%"
              : zoomedSpot === "relationships"
                ? "0%"
                : zoomedSpot === "mental-health"
                  ? "-30%"
                  : zoomedSpot === "geographics"
                    ? "5%"
              : "0%",
        }}
        transition={{
          duration: 1.2,
          ease: [0.76, 0, 0.24, 1], // cinematic in/out easing
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </motion.video>

      {/* Instruction text */}
      {!zoomedSpot && (
        <div className="absolute top-5 left-5 z-20 p-4 text-left text-white drop-shadow-lg inline-block">
          <p className="text-lg font-bold text-teal-300">
            <Search size={24} className="mr-2 text-teal-300 inline" />
            Click on an icon to explore
          </p>

        </div>
      )}

      {/* Hotspot icons (fade out on zoom) */}
      <AnimatePresence>
        {!zoomedSpot &&
          hotspots.map((spot) => (
            <motion.button
              key={spot.id}
              className="absolute z-30 text-white hover:text-primary transition-transform text-center"
              style={{ top: spot.y, left: spot.x }}
              whileHover={{ scale: 1.2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              onClick={() => setZoomedSpot(spot.id)}
            >
              <div className="flex flex-col items-center space-y-1 text-shadow-[#69b3a2]/30" >
                {spot.icon}
                <span className="text-sm font-semibold text-teal-300 text-shadow-[#69b3a2]/30" >
                  {spot.label}
                </span>
              </div>
            </motion.button>
          ))}
      </AnimatePresence>

      {/* Overlay fade (subtle background dimming) */}
      <motion.div
        className={`absolute inset-0 bg-black z-10 ${zoomedSpot ? 'cursor-pointer' : 'pointer-events-none'}`}
        animate={{ opacity: zoomedSpot ? 0.25 : 0.1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        onClick={() => setZoomedSpot(null)}
      />

      {/* Info card (appears after zoom) */}
      <AnimatePresence>
        {zoomedSpot && showInfo && selectedSpot && (
          <motion.div
            key={selectedSpot.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 md:w-2/3 lg:w-1/2 z-40 bg-white/10 backdrop-blur-md border border-teal-400/40 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-teal-300 flex items-center gap-2">
                  <button 
                    onClick={() => setZoomedSpot(null)}
                    className="hover:text-teal-100 transition-colors focus:outline-none"
                    aria-label="Go back"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  {selectedSpot.label}
                </h3>
                <p className="text-sm text-gray-300 mt-1">{selectedSpot.info}</p>
              </div>
              {/* Filters */}
              <div className="flex flex-col gap-2 text-xs">
                <select 
                  className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-white focus:outline-none focus:border-teal-400"
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                >
                  <option value="All" className="text-black">All Genders</option>
                  <option value="Male" className="text-black">Male</option>
                  <option value="Female" className="text-black">Female</option>
                </select>
                {/* <select 
                  className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-white focus:outline-none focus:border-teal-400"
                  value={filters.ageRange}
                  onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                >
                  <option value="All" className="text-black">All Ages</option>
                  <option value="18-21" className="text-black">18 - 21</option>
                  <option value="22-25" className="text-black">22 - 25</option>
                </select> */}
                <select 
                  className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-white focus:outline-none focus:border-teal-400"
                  value={filters.academicLevel}
                  onChange={(e) => setFilters({...filters, academicLevel: e.target.value})}
                >
                  <option value="All" className="text-black">All Levels</option>
                  <option value="High School" className="text-black">High School</option>
                  <option value="Undergraduate" className="text-black">Undergraduate</option>
                  <option value="Graduate" className="text-black">Graduate</option>
                </select>
                <RangeSlider
                  key={prop}
                  label={label}
                  min={ageBounds.min}
                  max={ageBounds.max}
                  initialMin={ageBounds.rangeMin}
                  initialMax={ageBounds.rangeMax}
                  onChange={handleAgeRangeChange}
                />
              </div>
            </div>

            <div className="w-full h-80 md:h-[28rem] relative">
              {zoomedSpot === 'academic' && (
  <div className="h-full w-full flex flex-col relative">
    <div className="absolute top-0 right-0 z-10">
      <select 
        className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-400"
        value={academicMetric}
        onChange={(e) => setAcademicMetric(e.target.value as 'Daily Usage' | 'Mental Health')}
      >
        <option value="Daily Usage" className="text-black">vs Daily Usage</option>
        <option value="Mental Health" className="text-black">vs Mental Health</option>
      </select>
    </div>
    <p className="text-xs text-center mb-2">Negative Academic Impact vs {academicMetric}</p>
    <div className="h-[500px]">
      <LineChart 
        data={academicMetric === 'Daily Usage' ? negativeImpactVsDailyUsageData : negativeImpactVsMentalHealthData} 
        xLabel={academicMetric === 'Daily Usage' ? "Daily Usage (hours)" : "Mental Health Score"} 
        yLabel="% Negative Impact" 
        color={academicMetric === 'Daily Usage' ? "#f472b6" : "#fb923c"}
      />
    </div>
  </div>
)}
              {zoomedSpot === 'relationships' && (
                <div className="h-full w-full flex flex-col relative">
                   <div className="absolute top-0 right-0 z-10">
                     <select 
                       className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-400"
                       value={conflictMetric}
                       onChange={(e) => setConflictMetric(e.target.value as 'Mental Health' | 'Daily Usage')}
                     >
                       <option value="Mental Health" className="text-black">vs Mental Health</option>
                       <option value="Daily Usage" className="text-black">vs Daily Usage</option>
                     </select>
                   </div>
                   <p className="text-xs text-center mb-2">Conflicts vs {conflictMetric}</p>
                   <div className="h-[500px]">
                     <LineChart 
                       data={conflictMetric === 'Mental Health' ? conflictsVsMentalHealthData : conflictsVsDailyUsageData} 
                       xLabel={conflictMetric === 'Mental Health' ? "Mental Health Score" : "Daily Usage (hours)"} 
                       yLabel="Avg Conflicts" 
                       color={conflictMetric === 'Mental Health' ? "#f472b6" : "#fb923c"}
                     />
                   </div>
                </div>
              )}
              {zoomedSpot === 'mental-health' && (
                <div className="h-full w-full flex flex-col relative">
                  <div className="absolute top-0 right-0 z-10">
                    <select 
                      className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-400"
                      value={mentalHealthMetric}
                      onChange={(e) => setMentalHealthMetric(e.target.value as 'Mental Health' | 'Sleep Hours')}
                    >
                      <option value="Mental Health" className="text-black">vs Mental Health</option>
                      <option value="Sleep Hours" className="text-black">vs Sleep Hours</option>
                    </select>
                  </div>
                  <p className="text-xs text-center mb-2">{mentalHealthMetric} vs Daily Usage</p>
                  <div className="h-[500px]">
                    <ScatterGraph 
                      data={mentalHealthMetric === 'Mental Health' ? mentalHealthVsUsageData : sleepVsUsageData} 
                      xLabel="Daily Usage (hours)" 
                      yLabel={mentalHealthMetric === 'Mental Health' ? "Mental Health Score" : "Sleep Hours"} 
                      color={mentalHealthMetric === 'Mental Health' ? "#59cccaff" : "#818cf8"}
                    />
                  </div>
                </div>
              )}
              {zoomedSpot === 'geographics' && (
                <div className="h-full overflow-y-auto custom-scrollbar">
                   <WorldMap studentData={filteredData} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit zoom button */}
      <AnimatePresence>
        {zoomedSpot && (
          <motion.button
            onClick={() => setZoomedSpot(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="absolute top-5 right-5 z-50 px-4 py-2 rounded-md text-sm font-medium bg-[#69b3a2]  transition-all duration-200 outline-none text-white shadow-xl shadow-[#69b3a2]/30 hover:bg-teal-500 cursor-pointer transform hover:-translate-y-0.5 hover:scale-105"
          >
            Exit Zoom
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
