import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Aurora from "../components/Aurora";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import NavbarLayout from "../components/NavbarLayout";

const keyVariables = [
  { variable: "Student_ID", type: "Integer", description: "Unique respondent identifier" },
  { variable: "Age", type: "Integer", description: "Age in years" },
  { variable: "Gender", type: "Categorical", description: "“Male” or “Female”" },
  { variable: "Academic_Level", type: "Categorical", description: "High School / Undergraduate / Graduate" },
  { variable: "Country", type: "Categorical", description: "Country of residence" },
  { variable: "Avg_Daily_Usage_Hours", type: "Float", description: "Average hours per day on social media" },
  { variable: "Most_Used_Platform", type: "Categorical", description: "Instagram, Facebook, TikTok, etc." },
  { variable: "Affects_Academic_Performance", type: "Boolean", description: "Self-reported impact on academics (Yes/No)" },
  { variable: "Sleep_Hours_Per_Night", type: "Float", description: "Average nightly sleep hours" },
  { variable: "Mental_Health_Score", type: "Integer", description: "Self-rated mental health (1 = poor to 10 = excellent)" },
  { variable: "Relationship_Status", type: "Categorical", description: "Single / In Relationship / Complicated" },
  { variable: "Conflicts_Over_Social_Media", type: "Integer", description: "Number of conflicts due to social media" },
  { variable: "Addicted_Score", type: "Integer", description: "Social Media Addiction Score (1 = low to 10 = high)" },
];

// --- 2. DEFINE THE ICONS WE'LL USE ---
// We use two shuffled arrays for visual variety
const logos1 = [
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
];
const logos2 = [
  FaYoutube,
  FaLinkedin,
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaTwitter,
];


const LogoTicker = ({
  icons,
  duration = 50,
  direction = "left",
}: {
  icons: React.ElementType[];
  duration?: number;
  direction?: "left" | "right";
}) => {
  const initialX = direction === "left" ? "0%" : "-50%";
  const animateX = direction === "left" ? "-50%" : "0%";

  return (
    <motion.div
      className="flex w-max"
      initial={{ x: initialX }}
      animate={{ x: animateX }}
      transition={{ ease: "linear", duration, repeat: Infinity }}
    >
      {[...icons, ...icons].map((Logo, i) => (
        <div key={i} className="flex-shrink-0 px-16">
          <Logo className="text-white/5 text-9xl" />
        </div>
      ))}
    </motion.div>
  );
};

export default function IntroductionPage() {
  const scrollToDataset = () => {
    const target = document.getElementById("organization");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };


  /* Scroll Animation Hook for Timeline Items */
  const TimelineItem = ({
    children,
    side = "start",
  }: {
    children: React.ReactNode;
    side: "start" | "end";
  }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

    return (
      <motion.li
        ref={ref}
        initial={{ opacity: 0, x: side === "start" ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.li>
    );
  };

  return (
    <div
      className="
        relative
        min-h-screen 
        text-base-content 
        pt-16 
        text-white
        overflow-x-hidden
        bg-gradient-to-b from-[#1a0d26] via-[#2a1a3a] to-[#1a0d26]
      "
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora
          blend={1.0}
          amplitude={1.2}
          speed={1}
        />
      </div>

      {/* HERO SECTION */}
      <section
        className="
          relative 
          flex flex-col-reverse md:flex-row 
          items-center justify-center 
          min-h-[90vh] px-8 
          text-white
          overflow-hidden
        "
      >
        <div className="absolute inset-0 z-5 pointer-events-none opacity-50 flex flex-col justify-center gap-20">
          <LogoTicker icons={logos1} duration={60} direction="left" />
          <LogoTicker icons={logos2} duration={60} direction="right" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="z-10 max-w-2xl text-center md:text-center space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-[#69b3a2]">
            Students’ Social Media Addiction
          </h1>

          <p className="text-lg md:text-xl leading-relaxed opacity-90">
            The <span className="font-semibold">Student Social Media & Relationships</span> dataset explores
            student behaviors, focusing on social media usage patterns, academic performance,
            and relationship dynamics across multiple countries.
          </p>

          <p className="text-lg md:text-xl leading-relaxed opacity-90">
            Each record represents a student’s self-reported experience, providing key insights for
            research, visualization, and predictive modeling.
          </p>

          <button onClick={scrollToDataset} className="btn btn-neutral mt-4">
            Explore ↓
          </button>
        </motion.div>

      </section>

      {/* MAIN CONTENT (All components are still here) */}
      <main className="container mx-auto px-6 py-12 space-y-16 z-10 relative" id="organization">

        {/* DATASET OVERVIEW */}
        <section className="space-y-8">
          <h2  className="text-4xl font-semibold text-center text-[#69b3a2]">
            Organization
          </h2>
          <NavbarLayout />
          <div id="dataset-overview" className="divider before:bg-gray-600 after:bg-gray-600"></div>
          <h2 className="text-4xl font-semibold text-center text-[#69b3a2]">
            Dataset Overview
          </h2>

          {/* Timeline */}
          <div className="flex justify-center">
            <ul className="timeline timeline-snap-icon timeline-vertical w-full max-w-7xl">

              {/* Scope & Coverage */}
              <TimelineItem side="end">
                <div className="timeline-middle">
                  <div className="bg-[#69b3a2] rounded-full w-4 h-4"></div>
                </div>
                <div className="timeline-end mb-10 md:text-start">
                  <div className="text-xl font-black text-[#69b3a2]">Scope & Coverage</div>
                  <p className="mt-2">
                    <span className="text-[#69b3a2]">•</span> <b>Population:</b> Students aged 18–24.<br />
                    <span className="text-[#69b3a2]">•</span> <b>Geography:</b> Bangladesh, India, USA, UK, Canada, and more.<br />
                    <span className="text-[#69b3a2]">•</span> <b>Timeframe:</b> Q1 2025 online survey.<br />
                    <span className="text-[#69b3a2]">•</span> <b>Volume:</b> 705 entries after cleaning.
                  </p>
                </div>
                <hr />
              </TimelineItem>

              {/* Methodology */}
              <TimelineItem side="start">
                <hr />
                <div className="timeline-middle">
                  <div className="bg-[#69b3a2] rounded-full w-4 h-4"></div>
                </div>
                <div className="timeline-start md:mb-10 md:text-end">
                  <div className="text-xl font-black text-[#69b3a2]">Data Collection & Methodology</div>
                  <p className="mt-2">
                    <span className="text-[#69b3a2]">•</span> Based on the Bergen Social Media Addiction Scale.<br />
                    <span className="text-[#69b3a2]">•</span> Recruited via universities and social media.
                  </p>
                </div>
                <hr />
              </TimelineItem>

              {/* Data Quality */}
              <TimelineItem side="end">
                <hr />
                <div className="timeline-middle">
                  <div className="bg-[#69b3a2] rounded-full w-4 h-4"></div>
                </div>
                <div className="timeline-end mb-10 md:text-start">
                  <div className="text-xl font-black text-[#69b3a2]">Data Quality Controls</div>
                  <p className="mt-2">
                    <span className="text-[#69b3a2]">•</span> Range validation (0–24 hours/day).<br />
                    <span className="text-[#69b3a2]">•</span> De-duplication via Student_ID.<br />
                    <span className="text-[#69b3a2]">•</span> Strict anonymization (no identifiers).
                  </p>
                </div>
              </TimelineItem>

            </ul>
          </div>
          <div id="key-variables" className="divider before:bg-gray-600 after:bg-gray-600"></div>

          {/* KEY VARIABLES TABLE */}
          <div className="lg:col-span-3">
            {/* ... (Table component) ... */}
            <h2 className="text-4xl font-semibold text-center text-[#69b3a2] mb-6">
              Key Variables
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-xl bg-gray-900/80">
              <table className="table w-full text-white">
                <thead className="bg-gray-900 text-[#69b3a2]">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Variable</th>
                    <th className="py-3 px-4 text-left font-semibold">Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {keyVariables.map((item) => (
                    <tr key={item.variable} className="hover:bg-gray-800">
                      <td className="py-3 px-4 font-mono text-sm text-sky-300/90">{item.variable}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="badge badge-outline text-[#69b3a2] border-[#69b3a2]">{item.type}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-200">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>
        <div id="limitations" className="divider before:bg-gray-600 after:bg-gray-600"></div>

        {/* LIMITATIONS */}
        <h2 className="text-4xl font-semibold text-center text-[#69b3a2]">
          Limitations
        </h2>

        <section>
          <div className="bg-gray-900/80 border border-gray-700 shadow-lg rounded-xl p-6">
            <h3 className="font-semibold text-[#69b3a2] text-xl mb-2">Dataset Limitations</h3>
            <div className="text-md text-gray-200">
              <span className="text-[#69b3a2]">•</span> Self-report bias may affect accuracy.<br />
              <span className="text-[#69b3a2]">•</span> Data collected at one point in time (no causal inference).
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer footer-center py-8 bg-[#2a1a3a] text-gray-300 border-t border-gray-700">
        {/* ... (Footer component) ... */}
        <p className="text-sm">
          © 2025 — Dataset documentation for <span className="font-medium">Students' Social Media Addiction</span>
        </p>
      </footer>
    </div>
  );
}