import IntroductionPage from "./pages/IntroductionPage";
import Navbar from "./components/Navbar";
import { Routes, Route, useLocation } from 'react-router-dom';
import InterestingFinds from "./pages/InterestingFinds";
import AnalyzeData from "./pages/AnalyzeData";
import ExploreRoom from "./pages/ExploreRoom";
import { useState } from "react";
import { useEffect } from "react";

function App() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeRoutes = ["/explore-room"];
    setIsDarkMode(darkModeRoutes.includes(location.pathname));
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isDarkMode={isDarkMode} />

      <div
        className={`flex-grow overflow-y-auto transition-colors duration-300 `}
      >
        <Routes>
          <Route path="/" element={<IntroductionPage />} />
          <Route path="/interesting-finds" element={<InterestingFinds />} />
          <Route path="/analyze-data" element={<AnalyzeData />} />
          <Route path="/explore-room" element={<ExploreRoom />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
