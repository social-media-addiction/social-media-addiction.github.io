// Data for the 'Key Variables' table
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
  { variable: "Conflicts_Over_Social_Media", type: "Integer", description: "Number of relationship conflicts due to social media" },
  { variable: "Addicted_Score", type: "Integer", description: "Social Media Addiction Score (1 = low to 10 = high)" },
];

// Helper component for the placeholder illustration
const IntroIllustration = () => (
<img
  src="https://thumbs.dreamstime.com/b/teenager-people-having-fun-using-smartphones-millenial-community-sharing-content-social-media-network-mobile-smart-phones-139999088.jpg"
  alt=""
  className="rounded-lg"
/>

);

// We use this font to match the handwritten style in your mockups
const titleFont = { fontFamily: 'Comic Sans MS, cursive, sans-serif' };

function IntroductionPage() {
  return (
    // THE FIX IS HERE: `pt-16` adds top padding to offset the navbar.
    // A standard DaisyUI navbar is h-16 (64px).
    // If your navbar is taller, you might need `pt-20` (80px).
    <div data-theme="light" className="min-h-screen bg-base-200 text-base-content pt-16">
      
      {/* 1. Hero Section (from Mockup 1 Title) */}
      <div className="hero min-h-[350px] bg-primary text-primary-content shadow-lg">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold" style={titleFont}>
              Students' Social Media Addiction
            </h1>
            <p className="py-6 text-lg md:text-xl font-medium">
              A Cross-Country Survey of Usage Patterns, Academic Impact, and Relationship
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Wrapper */}
      <main className="container mx-auto p-4 md:p-8">

        {/* 3. Introduction Section (from Mockup 1) */}
        <section id="intro" className="mb-12 lg:mb-16 p-6 md:p-8 bg-base-100 rounded-2xl shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            
            {/* Left Col: Text */}
            <div className="lg:col-span-3">
              <h2 className="text-4xl font-bold mb-4 text-accent" style={titleFont}>
                Introduction
              </h2>
              <div className="space-y-4 text-base-content/90">
                <p>
                  The Student Social Media & Relationships dataset contains anonymized records of students’ social‐media behaviors and related life outcomes. It spans multiple countries and academic levels, focusing on key dimensions such as usage intensity, platform preferences, and relationship dynamics.
                </p>
                <p>
                  Each row represents one student’s survey response, offering a cross‐sectional snapshot suitable for statistical analysis and machine‐learning applications.
                </p>
              </div>
            </div>
            
            {/* Right Col: Illustration */}
            <div className="lg:col-span-2 flex items-center justify-center p-4">
              <IntroIllustration />
            </div>
          </div>
        </section>

        {/* 4. Data Section (from Mockup 2) */}
        <section id="data" className="mb-12 lg:mb-16 p-6 md:p-8 bg-base-100 rounded-2xl shadow-xl">
          <h2 className="text-4xl font-bold mb-8 text-center" style={titleFont}>
            Data
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Left Col: Details (Scope, Methodology, etc.) */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Scope & Coverage</h3>
                <ul className="list-disc list-outside pl-5 space-y-2 text-base-content/90">
                  <li><strong>Population:</strong> Students aged 16–25 (high school, undergraduate, graduate).</li>
                  <li><strong>Geography:</strong> Multi‐country coverage (e.g., Bangladesh, India, USA, UK, Canada, etc.).</li>
                  <li><strong>Timeframe:</strong> One-time online survey in Q1 2025.</li>
                  <li><strong>Volume:</strong> Configurable sample sizes (100, 500, 1,000 records).</li>
                </ul>
              </div>
              
              <div className="divider lg:hidden"></div>

              <div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Data Collection & Methodology</h3>
                <ul className="list-disc list-outside pl-5 space-y-2 text-base-content/90">
                  <li><strong>Survey Design:</strong> Adapted from validated scales (e.g., Bergen Social Media Addiction Scale).</li>
                  <li><strong>Recruitment:</strong> University mailing lists and social-media platforms.</li>
                </ul>
              </div>
              
              <div className="divider lg:hidden"></div>

              <div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Data Quality Controls</h3>
                <ul className="list-disc list-outside pl-5 space-y-2 text-base-content/90">
                  <li><strong>Validation:</strong> Mandatory fields and range checks (e.g., usage hours 0–24).</li>
                  <li><strong>De‐duplication:</strong> Removal of duplicates via unique `Student_ID`.</li>
                  <li><strong>Anonymization:</strong> No personally identifiable information (PII) collected.</li>
                </ul>
              </div>
            </div>

            {/* Right Col: Key Variables Table */}
            <div className="lg:col-span-3">
              <h3 className="text-2xl font-semibold mb-4 text-primary">Key Variables</h3>
              <div className="overflow-x-auto rounded-lg shadow-md border border-base-300">
                <table className="table table-zebra w-full">
                  {/* Table Head */}
                  <thead className="bg-base-300">
                    <tr>
                      <th className="py-3 px-4 font-bold text-base text-base-content">Variable</th>
                      <th className="py-3 px-4 font-bold text-base text-base-content">Type</th>
                      <th className="py-3 px-4 font-bold text-base text-base-content">Description</th>
                    </tr>
                  </thead>
                  {/* Table Body */}
                  <tbody>
                    {keyVariables.map((item) => (
                      <tr key={item.variable} className="hover">
                        <td className="py-3 px-4 font-mono text-sm font-medium text-secondary">{item.variable}</td>
                        <td className="py-3 px-4"><span className="badge badge-ghost badge-sm">{item.type}</span></td>
                        <td className="py-3 px-4 text-sm text-base-content/90">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Analysis & Limitations Section (from Context) */}
        <section id="analysis" className="mb-12 lg:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Potential Analyses Card */}
            <div className="card bg-base-100 shadow-lg transition-all hover:shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl font-semibold">Potential Analyses 🔬</h3>
                <ul className="list-disc list-outside pl-5 space-y-2 mt-4 text-base-content/90">
                  <li><strong>Correlation Studies:</strong> Examine associations between daily usage, mental‐health score, and sleep hours.</li>
                  <li><strong>Predictive Modeling:</strong> Build classifiers to predict relationship conflicts based on usage patterns.</li>
                  <li><strong>Clustering:</strong> Identify user segments (e.g., “high‐usage high‐stress”) across countries.</li>
                </ul>
              </div>
            </div>

            {/* Limitations Card */}
            <div className="card bg-warning text-warning-content shadow-lg transition-all hover:shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl font-semibold">Limitations ⚠️</h3>
                <ul className="list-disc list-outside pl-5 space-y-2 mt-4">
                  <li><strong>Self‐Report Bias:</strong> Measures are self-reported and may be subject to social‐desirability effects.</li>
                  <li><strong>Cross‐Sectional Design:</strong> One-time survey prevents any causal inference.</li>
                  <li><strong>Sampling Variability:</strong> Online recruitment may underrepresent students with limited internet access.</li>
                </ul>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <footer className="footer footer-center p-6 bg-base-300 text-base-content rounded-t-lg">
        <div>
          <p>Copyright © 2025 - All rights reserved. Dataset documentation for "Students' Social Media Addiction".</p>
        </div>
      </footer>
      
    </div>
  );
}

export default IntroductionPage;