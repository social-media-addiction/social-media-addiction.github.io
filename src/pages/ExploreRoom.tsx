import { motion, AnimatePresence } from "framer-motion";
import { JSX, useState } from "react";
import { Brain, Users, GraduationCap } from "lucide-react";
import bgVideo from "../assets/videos/bg-small.mp4";

interface Hotspot {
  id: string;
  x: string; // position in %
  y: string;
  icon: JSX.Element;
  label: string;
}

const hotspots: Hotspot[] = [
  {
    id: "academic",
    x: "25%",
    y: "60%",
    icon: <GraduationCap size={40} color="#59cccaff" />,
    label: "Academic Performance",
  },
  {
    id: "relationships",
    x: "88%",
    y: "40%",
    icon: <Users size={28} color="#59cccaff" />,
    label: "Relationships",
  },
  {
    id: "mental-health",
    x: "45%",
    y: "72%",
    icon: <Brain size={28} color="#59cccaff" />,
    label: "Mental Health",
  },
];

export default function HeroVideo() {
  const [zoomedSpot, setZoomedSpot] = useState<string | null>(null);

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
          x:
            zoomedSpot === "academic"
              ? "48%"
              : zoomedSpot === "relationships"
              ? "-55%"
              : zoomedSpot === "mental-health"
              ? "0%"
              : "0%",
          y:
            zoomedSpot === "academic"
              ? "-25%"
              : zoomedSpot === "relationships"
              ? "-10%"
              : zoomedSpot === "mental-health"
              ? "15%"
              : "0%",
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <source src={bgVideo} type="video/mp4" />
      </motion.video>

      {/* Instruction text */}
      <div className="absolute top-20 left-5 z-20 p-4 text-left text-white drop-shadow-lg">
        <p className="text-lg font-bold">Click on an icon to explore</p>
      </div>

      {/* Hotspot icons (disappear on zoom) */}
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
              onClick={() =>
                setZoomedSpot((prev) => (prev === spot.id ? null : spot.id))
              }
            >
              <div className="flex flex-col items-center space-y-1">
                {spot.icon}
                <span className="text-sm font-semibold text-teal-300">
                  {spot.label}
                </span>
              </div>
            </motion.button>
          ))}
      </AnimatePresence>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />

      {/* Exit zoom button */}
      <AnimatePresence>
        {zoomedSpot && (
          <motion.button
            onClick={() => setZoomedSpot(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-5 right-5 z-40 btn btn-sm bg-teal-400 border-teal-400 text-black font-semibold"
          >
            Exit Zoom
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
