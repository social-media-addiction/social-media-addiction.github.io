import IntroductionPage from "./pages/IntroductionPage";
import Navbar from "./components/Navbar";
import { Routes, Route } from 'react-router-dom';
import InterestingFinds from "./pages/InterestingFinds";
import AnalyzeData from "./pages/AnalyzeData";

function App() {
  const main_path = "/VI/";
  return (
  <>
  <Navbar />
  <Routes>
    <Route path={main_path} element={<IntroductionPage />} />
    <Route path={`${main_path}interesting-finds`} element={<InterestingFinds />} />
    <Route path={`${main_path}analyze-data`} element={<AnalyzeData />} />

  </Routes>
  </>
  );
}

export default App;
