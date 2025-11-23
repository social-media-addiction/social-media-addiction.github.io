import { useState } from "react";
import { motion } from "framer-motion";

const PageInfoTabs = () => {
  const tabs = [
    {
      id: "intro",
      title: "Introduction",
      description:
        "Overview of the project, context, and purpose. Introduces the Dataset Overview, Variables, and Limitations",
    },

    {
      id: "interesting-finds",
      title: "Interesting Finds",
      description:
        "The most notable insights from the data analysis, discovered through detailed examination of the dataset.",
    },
    {
      id: "analyze-data",
      title: "Analyze Data",
      description:
        "Explore and filter all visualizations, with usage patterns, mental health correlations, and academic impacts.",
    },
        {
      id: "explore-room",
      title: "Explore Room",
      description:
        "Interactive room for more intuitive exploration of the dataset and findings.",
    },
  ];

  const [active, setActive] = useState("intro");

  return (
    <div className="w-full max-w-5xl mx-auto mt-16">
      <div
        className="
        bg-gray-900/60 
        border border-teal-500/20
        rounded-2xl 
        shadow-xl 
        backdrop-blur-md
        p-6
        items-center
        "
        style={{ boxShadow: "0 8px 32px 0 rgba(0, 128, 128, 0.37)" }}
      >
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer
                ${
                  active === tab.id
                    ? "bg-[#69b3a2] text-black shadow-md"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }
              `}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Description Box */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-gray-200 text-lg leading-relaxed text-center"
        >
          {tabs.find((t) => t.id === active)?.description}
        </motion.div>
      </div>
    </div>
  );
};

export default PageInfoTabs;
