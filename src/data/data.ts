import * as d3 from "d3";

export interface StudentRecord {
  Student_ID: number;
  Age: number;
  Gender: string;
  Academic_Level: string;
  Country: string;
  Avg_Daily_Usage_Hours: number;
  Most_Used_Platform: string;
  Affects_Academic_Performance: boolean;
  Sleep_Hours_Per_Night: number;
  Mental_Health_Score: number;
  Relationship_Status: string;
  Conflicts_Over_Social_Media: number;
  Addicted_Score: number;
}

export interface FilterCriteria {
  [key: string]: (string | number | boolean | undefined) | (string | number | boolean)[];
}

export const filterData = (data: StudentRecord[], filters: FilterCriteria): StudentRecord[] => {
  return data.filter(record => {
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        const filterValue = filters[key];
        if (filterValue !== undefined) {
          const recordValue = record[key as keyof StudentRecord];

          if (Array.isArray(filterValue)) {
            // Special handling for range filters (like Age)
            if (key === 'Age' && filterValue.length === 2 && typeof filterValue[0] === 'number' && typeof filterValue[1] === 'number') {
              // Range filter: check if value is between min and max
              const [minVal, maxVal] = filterValue as [number, number];
              if (typeof recordValue === 'number' && (recordValue < minVal || recordValue > maxVal)) {
                return false;
              }
            } else {
              // Multi-select filter: check if the record's value is included in the array
              if (!filterValue.includes(recordValue)) {
                return false;
              }
            }
          } else {
            // Otherwise, perform a direct comparison
            if (recordValue !== filterValue) {
              return false;
            }
          }
        }
      }
    }
    return true;
  });
};

export interface Insights {
  avgUsage: number;
  avgSleep: number;
  avgMentalHealth: number;
  topPlatform: string;
  addictionVsSleep: number;
  genderSplit: Map<string, number>;
  platformDistribution: Map<string, number>;
  usageByAge: Map<number, number>;
  mentalHealthByUsage: Array<{ usage: number, mentalHealth: number }>;
  sleepVsAddiction: Array<{ sleep: number, addiction: number }>;
  academicImpact: { yes: number, no: number };
  relationshipStats: Map<string, number>;
  ageDistribution: Map<number, number>;
  conflictDistribution: Map<number, number>;
  conflictsByDailyUsage: Map<number, number>;
}

export const loadStudentData = async (path: string): Promise<StudentRecord[]> => {
  const csv = await d3.csv(path);
  return csv.map((d) => ({
    Student_ID: +d.Student_ID!,
    Age: +d.Age!,
    Gender: d.Gender!,
    Academic_Level: d.Academic_Level!,
    Country: d.Country!,
    Avg_Daily_Usage_Hours: +d.Avg_Daily_Usage_Hours!,
    Most_Used_Platform: d.Most_Used_Platform!,
    Affects_Academic_Performance: d.Affects_Academic_Performance === "Yes",
    Sleep_Hours_Per_Night: +d.Sleep_Hours_Per_Night!,
    Mental_Health_Score: +d.Mental_Health_Score!,
    Relationship_Status: d.Relationship_Status!,
    Conflicts_Over_Social_Media: +d.Conflicts_Over_Social_Media!,
    Addicted_Score: +d.Addicted_Score!,
  }));
};

export const get_countries = (data: StudentRecord[]): string[] => {
  return Array.from(new Set(data.map(d => d.Country))).sort();
}

export const generateInsights = (data: StudentRecord[]): Insights => {
  const avgUsage = d3.mean(data, (d) => d.Avg_Daily_Usage_Hours) ?? 0;
  const avgSleep = d3.mean(data, (d) => d.Sleep_Hours_Per_Night) ?? 0;
  const avgMentalHealth = d3.mean(data, (d) => d.Mental_Health_Score) ?? 0;

  const platformCounts = d3.rollup(data, (v) => v.length, (d) => d.Most_Used_Platform);
  const topPlatform = Array.from(platformCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  const addictionVsSleep = d3.mean(data, (d) => d.Addicted_Score / d.Sleep_Hours_Per_Night) ?? 0;

  return {
    avgUsage,
    avgSleep,
    avgMentalHealth,
    topPlatform,
    addictionVsSleep,
    genderSplit: d3.rollup(data, (v) => v.length, (d) => d.Gender),
    platformDistribution: platformCounts,
    usageByAge: d3.rollup(data, (v) => d3.mean(v, d => d.Avg_Daily_Usage_Hours) ?? 0, (d) => d.Age),
    mentalHealthByUsage: data.map(d => ({ usage: d.Avg_Daily_Usage_Hours, mentalHealth: d.Mental_Health_Score })),
    sleepVsAddiction: data.map(d => ({ sleep: d.Sleep_Hours_Per_Night, addiction: d.Addicted_Score })),
    academicImpact: {
      yes: data.filter(d => d.Affects_Academic_Performance).length,
      no: data.filter(d => !d.Affects_Academic_Performance).length
    },
    relationshipStats: d3.rollup(data, (v) => v.length, (d) => d.Relationship_Status),
    ageDistribution: d3.rollup(data, (v) => v.length, (d) => d.Age),
    conflictDistribution: d3.rollup(data, (v) => v.length, (d) => d.Conflicts_Over_Social_Media),
    conflictsByDailyUsage: d3.rollup(data, (v) => d3.mean(v, d => d.Conflicts_Over_Social_Media) ?? 0, (d) => Math.round(d.Avg_Daily_Usage_Hours))
  };
};
