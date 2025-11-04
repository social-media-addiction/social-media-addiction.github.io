import IntroductionPage from "./pages/IntroductionPage";
import Navbar from "./components/Navbar";
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
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
    <>
      <Navbar isDarkMode={isDarkMode} />

      <div
        className={`min-h-screen transition-colors duration-300 `}
      >
        <HashRouter>
        <Routes>
          <Route path="/" element={<IntroductionPage />} />
          <Route path="/interesting-finds" element={<InterestingFinds />} />
          <Route path="/analyze-data" element={<AnalyzeData />} />
          <Route path="/explore-room" element={<ExploreRoom />} />
        </Routes></HashRouter>
      </div>
    </>
  );
}

export default App;
