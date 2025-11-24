import { motion, AnimatePresence } from "framer-motion";
import { ReactElement, useState, useEffect, useMemo } from "react";
import { Brain, Users, GraduationCap, Globe, ChevronLeft } from "lucide-react";
import LineChart, { LineChartData } from "../components/LineChart";
import ScatterGraph, { ScatterData } from '../components/ScatterGraph';
import bgVideo from "../assets/videos/bg-small.mp4";


import WorldMap, { METRIC_OPTIONS } from '../components/WorldMap';
import { StudentRecord, loadStudentData } from "../data/data";
import * as d3 from 'd3';
import RangeSlider from "../components/RangeSlider";

interface Hotspot {
  id: string;
  x: string;
  y: string;
  icon: ReactElement;
  label: string;
}

const hotspots: Hotspot[] = [
  {
    id: "academic",
    x: "24%",
    y: "60%",
    icon: <GraduationCap size={40} color="#59cccaff" />,
    label: "Academic Performance",
  },
  {
    id: "relationships",
    x: "48.5%",
    y: "51%",
    icon: <Users size={28} color="#59cccaff" />,
    label: "Conflicts & Relationships",
  },
  {
    id: "mental-health",
    x: "46%",
    y: "72%",
    icon: <Brain size={28} color="#59cccaff" />,
    label: "Mental Health & Sleep",
  },

  {
    id: "geographics",
    x: "88%",
    y: "40%",
    icon: <Globe size={28} color="#59cccaff" />,
    label: "Geographics",
  }
];

export default function ExploreRoom() {
  const [zoomedSpot, setZoomedSpot] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [data, setData] = useState<StudentRecord[]>([]);
  const [filters, setFilters] = useState({
    gender: [] as string[],          // ["Male", "Female"] etc.
    ageRange: 'All',
    academicLevel: [] as string[]    // ["High School", "Graduate"] etc.
  });

  const [conflictMetric, setConflictMetric] = useState<'Mental Health' | 'Daily Usage'>('Mental Health');
  const [academicMetric, setAcademicMetric] = useState<'Daily Usage' | 'Mental Health'>('Daily Usage');
  const [mentalHealthMetric, setMentalHealthMetric] = useState<'Mental Health' | 'Sleep Hours'>('Mental Health');
  const [mapMetric, setMapMetric] = useState<keyof StudentRecord | "Count">("Count");

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

  const handleAgeRangeChange = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, ageRange: `${min}-${max}` }));
  };

  useEffect(() => {
    if (zoomedSpot) {
      const timer = setTimeout(() => setShowInfo(true), 500); // slight delay
      return () => clearTimeout(timer);
    } else {
      setShowInfo(false);
    }
  }, [zoomedSpot]);

  const selectedSpot = hotspots.find((s) => s.id === zoomedSpot);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (filters.gender.length > 0 && !filters.gender.includes(d.Gender)) return false;
      if (filters.academicLevel.length > 0 && !filters.academicLevel.includes(d.Academic_Level)) return false;

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

  // New: Negative Academic Impact vs Daily Usage
  const negativeImpactVsDailyUsageData = useMemo((): LineChartData[] => {
    if (filteredData.length === 0) return [];
    // Group by rounded daily usage hours and compute percentage of negative impact (0-100)
    const grouped = d3.rollup(
      filteredData,
      v => (d3.mean(v, d => d.Affects_Academic_Performance ? 1 : 0) || 0) * 100,
      d => Math.round(d.Avg_Daily_Usage_Hours)
    );
    return Array.from(grouped, ([x, y]) => ({ x, y: Math.round((y as number) * 10) / 10 })).sort((a, b) => (a.x as number) - (b.x as number));
  }, [filteredData]);

  const negativeImpactVsMentalHealthData = useMemo((): LineChartData[] => {
    if (filteredData.length === 0) return [];
    // Group by mental health score and compute proportion of negative impact
    const grouped = d3.rollup(
      filteredData,
      v => (d3.mean(v, d => d.Affects_Academic_Performance ? 1 : 0) || 0) * 100,
      d => d.Mental_Health_Score
    );
    return Array.from(grouped, ([x, y]) => ({ x, y })).sort((a, b) => (a.x as number) - (b.x as number));
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
          duration: 0.6,
          ease: [0.76, 0, 0.24, 1], // cinematic in/out easing
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </motion.video>

      {/* Instruction text */}
      {!zoomedSpot && (
        <div className="absolute top-5 left-5 z-20 p-4 text-left text-white drop-shadow-lg inline-block">
          <p className="text-lg font-bold text-teal-300"
            style={{ filter: "drop-shadow(0 8px 20px rgba(0, 238, 255, 0.61))" }}>
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
              className="absolute z-30 text-white hover:text-primary transition-transform text-center cursor-pointer rounded-lg"
              style={{ top: spot.y, left: spot.x }}
              whileHover={{ scale: 1.2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              onClick={() => setZoomedSpot(spot.id)}
            >
              <div className="flex flex-col items-center space-y-1 text-shadow-[#69b3a2]/30" >
                <span
                  className="rounded-full p-1 transition-shadow"
                  style={{ filter: "drop-shadow(0 8px 20px rgba(0, 238, 255, 1))" }}
                >
                  {spot.icon}
                </span>
                <span className="text-sm font-semibold text-teal-300 text-shadow-[#69b3a2]/30"
                  style={{ filter: "drop-shadow(0 8px 20px rgba(0, 238, 255, 1))" }}>
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
        transition={{ duration: zoomedSpot ? 0.6 : 0.5, ease: "easeInOut" }}
        onClick={() => setZoomedSpot(null)}
      />

      {/* Left Fixed Filter Panel */}
      <AnimatePresence>
        {zoomedSpot && (
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="
        fixed top-1/2 left-7
        -translate-y-1/2
        w-72
        max-h-[90vh] 
        overflow-y-auto
        bg-gray-900/50
        backdrop-blur-lg
        border border-teal-400/40
        text-white
        rounded-xl
        p-6
        shadow-lg
        z-50"
          >
            <h3 className="text-xl font-bold text-teal-300 mb-3">Filters</h3>

            {/* Gender */}
            <div className="mb-4">
              <p className="text-teal-300 font-semibold mb-1">Gender</p>
              {["Male", "Female"].map(g => (
                <label key={g} className="flex items-center gap-2 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm rounded-sm bg-white/10 text-teal-300"
                    checked={filters.gender.includes(g)}
                    onChange={(e) => {
                      setFilters(prev => ({
                        ...prev,
                        gender: e.target.checked
                          ? [...prev.gender.filter(x => x !== "All"), g]
                          : prev.gender.filter(x => x !== g)
                      }));
                    }}
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>

            {/* Academic Level */}
            <div className="mb-4">
              <p className="text-teal-300 font-semibold mb-1">Academic Level</p>
              {["High School", "Undergraduate", "Graduate"].map(level => (
                <label key={level} className="flex items-center gap-2 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm rounded-sm bg-white/10 text-teal-300"
                    checked={filters.academicLevel.includes(level)}
                    onChange={(e) => {
                      setFilters(prev => ({
                        ...prev,
                        academicLevel: e.target.checked
                          ? [...prev.academicLevel.filter(a => a !== "All"), level]
                          : prev.academicLevel.filter(a => a !== level)
                      }));
                    }}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>

            {/* Age Range */}
            <div>
              <p className="text-teal-300 font-semibold mb-1">Age Range</p>
              <RangeSlider
                key="age-slider"
                min={ageBounds.min}
                max={ageBounds.max}
                initialMin={ageBounds.rangeMin}
                initialMax={ageBounds.rangeMax}
                onChange={handleAgeRangeChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Info card (appears after zoom) */}
      <AnimatePresence>
        {zoomedSpot && showInfo && selectedSpot && (
          <motion.div
            key={selectedSpot.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="
        absolute top-1/2 left-1/2 
        transform -translate-x-1/2 -translate-y-1/2
        max-w-[calc(100vw-20rem)] 
        w-11/12 md:w-3/4 lg:w-3/5
        z-50
        bg-gray-900/50
        backdrop-blur-md
        border border-teal-400/40
        text-white
        rounded-2xl
        p-6
        shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-teal-300 flex items-center gap-2">
                  <button
                    onClick={() => setZoomedSpot(null)}
                    className="hover:text-teal-100 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Go back"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  {selectedSpot.label}
                </h3>
              </div>


            </div>

            <div className="w-full h-96 md:h-[34rem] relative">
              {zoomedSpot === 'academic' && (
                <div className="h-full w-full flex flex-col relative">
                  <div className="absolute top-0 left-0 z-10">
                    <select
                      className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-md text-white focus:outline-none focus:border-teal-400"
                      value={academicMetric}
                      onChange={(e) => setAcademicMetric(e.target.value as 'Daily Usage' | 'Mental Health')}
                    >
                      <option value="Daily Usage" className="text-white" style={{ backgroundColor: '#414053' }}>vs Daily Usage</option>
                      <option value="Mental Health" className="text-white" style={{ backgroundColor: '#414053' }}>vs Mental Health</option>
                    </select>
                  </div>
                  <p className="text-md text-center mb-2">Negative Academic Impact vs {academicMetric}</p>
                  <div className="h-[500px]">
                    <LineChart
                      data={academicMetric === 'Daily Usage' ? negativeImpactVsDailyUsageData : negativeImpactVsMentalHealthData}
                      xLabel={academicMetric === 'Daily Usage' ? "Daily Usage (hours)" : "Mental Health Score"}
                      yLabel="% Negatively Affected"
                      color={academicMetric === 'Daily Usage' ? "#f472b6" : "#fb923c"}
                      yDomain={[0, 100]}
                    />
                  </div>
                </div>
              )}
              {zoomedSpot === 'relationships' && (
                <div className="h-full w-full flex flex-col relative">
                  <div className="absolute top-0 left-0 z-10">
                    <select
                      className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-md text-white focus:outline-none focus:border-teal-400"
                      value={conflictMetric}
                      onChange={(e) => setConflictMetric(e.target.value as 'Mental Health' | 'Daily Usage')}
                    >
                      <option value="Mental Health" className="text-white" style={{ backgroundColor: '#414053' }}>vs Mental Health</option>
                      <option value="Daily Usage" className="text-white" style={{ backgroundColor: '#414053' }}>vs Daily Usage</option>
                    </select>
                  </div>
                  <p className="text-md text-center mb-2">Conflicts vs {conflictMetric}</p>
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
                  <div className="absolute top-0 left-0 z-10">
                    <select
                      className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-md text-white focus:outline-none focus:border-teal-400"
                      value={mentalHealthMetric}
                      onChange={(e) => setMentalHealthMetric(e.target.value as 'Mental Health' | 'Sleep Hours')}
                    >
                      <option value="Mental Health" className="text-white" style={{ backgroundColor: '#414053' }}>Mental Health</option>
                      <option value="Sleep Hours" className="text-white" style={{ backgroundColor: '#414053' }}>Sleep Hours</option>
                    </select>
                  </div>
                  <p className="text-md text-center mb-2">{mentalHealthMetric} vs Daily Usage</p>
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
                <div className="h-full w-full flex flex-col relative">
                  <div className="absolute top-0 left-0 z-10">
                    <select
                      className="bg-white/10 border border-teal-400/30 rounded px-2 py-1 text-md text-white focus:outline-none focus:border-teal-400"
                      value={mapMetric}
                      onChange={(e) => setMapMetric(e.target.value as keyof StudentRecord | "Count")}
                    >
                      {METRIC_OPTIONS.map((m) => (
                        <option key={m.key} value={m.key} className="text-white" style={{ backgroundColor: '#414053' }}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 w-full min-h-0 flex items-center justify-center pt-8">
                    <WorldMap studentData={filteredData} metric={mapMetric} onMetricChange={setMapMetric} hideControls />
                  </div>
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
            className="absolute top-5 right-5 z-50 px-4 py-2 rounded-md text-sm font-medium bg-teal-500 transition-all duration-200 outline-none text-white hover:bg-teal-500 cursor-pointer transform hover:-translate-y-0.5 hover:scale-105"
          >
            Exit Zoom
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
