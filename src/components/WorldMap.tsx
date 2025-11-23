import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { StudentRecord } from "../data/data";
import { feature, mesh } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";

interface WorldMapProps {
    studentData: StudentRecord[];
    onCountrySelect?: (country: string, value: number | undefined) => void;
    metric?: keyof StudentRecord | "Count";
    onMetricChange?: (metric: keyof StudentRecord | "Count") => void;
    hideControls?: boolean;
}

// Dataset (key) -> Map_Name (value)
const countryNameMapping = new Map<string, string>([
    ["USA", "United States of America"],
    ["UK", "United Kingdom"],
    ["South Korea", "Republic of Korea"],
    ["Bosnia", "Bosnia and Herzegovina"],
    ["Czech Republic", "Czechia"],
    ["UAE", "United Arab Emirates"],
    ["Syria", "Syrian Arab Republic"],
    ["Trinidad", "Trinidad and Tobago"],
    ["Vatican City", "Vatican"]
]);

function getMappedCountryName(datasetCountryName: string): string {
    return countryNameMapping.get(datasetCountryName) || datasetCountryName; // return mapped name or original if not found
}

export const METRIC_OPTIONS = [
    { key: "Count", label: "Number of Students" },
    { key: "Addicted_Score", label: "Addiction Score" },
    { key: "Avg_Daily_Usage_Hours", label: "Daily Usage (hours)" },
    { key: "Sleep_Hours_Per_Night", label: "Sleep (hours)" },
    { key: "Mental_Health_Score", label: "Mental Health Score" },
];

function aggregateByCountry(data: StudentRecord[], metric: keyof StudentRecord | "Count") {
    return new Map(
        d3.rollup(
            data,
            v => metric === "Count" ? v.length : (d3.mean(v, d => Number(d[metric as keyof StudentRecord])) ?? 0),
            d => getMappedCountryName(d.Country)
        )
    );
}

const WorldMap: React.FC<WorldMapProps> = ({ studentData, onCountrySelect, metric: externalMetric, onMetricChange, hideControls }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [internalMetric, setInternalMetric] = useState<keyof StudentRecord | "Count">("Count");
    const metric = externalMetric || internalMetric;
    const [countriesData, setCountriesData] = useState<FeatureCollection<Geometry, { name: string }> | null>(null);
    const [countryMeshData, setCountryMeshData] = useState<any | null>(null);
    const valuemap = aggregateByCountry(studentData, metric);

    const handleMetricChange = (newMetric: keyof StudentRecord | "Count") => {
        if (onMetricChange) {
            onMetricChange(newMetric);
        } else {
            setInternalMetric(newMetric);
        }
    };

    useEffect(() => {
    async function loadMapData() {
      try {
        const worldData = await d3.json(
          "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
        ) as any;

        const countries = feature(
          worldData,
          worldData.objects.countries
        ) as unknown as FeatureCollection<Geometry, { name: string }>;

        const meshData = mesh(
          worldData,
          worldData.objects.countries,
          (a, b) => a !== b
        );

        setCountriesData(countries);
        setCountryMeshData(meshData);

      } catch (error) {
        console.error("Erro ao carregar dados do mapa:", error);
      }
    }

    loadMapData();
  }, []);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !countriesData || !countryMeshData) {
      return;
    }

        const width = 928;
        const marginTop = 40;
        const height = width / 2 + marginTop;

        const values = Array.from(valuemap.values());
        const [minVal, maxVal] = d3.extent(values) as [number, number];

        const colorDomain = [minVal ?? 0, maxVal ?? 1];
        
        // Define color schemes based on metric
        let colorInterpolator;
        switch(metric) {
          case 'Addicted_Score':
            // Light teal (lower addiction/better) to Dark orange (high addiction/worse)
            colorInterpolator = d3.interpolateRgb("#5eead4", "#c2410c");
            break;
          case 'Avg_Daily_Usage_Hours':
            // Light blue (low usage) to Dark blue (high usage)
            colorInterpolator = d3.interpolateRgb("#bfdbfe", "#1e3a8a");
            break;
          case 'Sleep_Hours_Per_Night':
            // Dark purple (less sleep) to Light cyan (more sleep)
            colorInterpolator = d3.interpolateRgb("#7c3aed", "#67e8f9");
            break;
          case 'Mental_Health_Score':
            // Dark blue (poor mental health/worse) to Light yellow (good mental health/better)
            colorInterpolator = d3.interpolateRgb("#1e3a8a", "#fef08a");
            break;
          case 'Count':
            // Light purple to Dark purple
            colorInterpolator = d3.interpolateRgb("#e9d5ff", "#581c87");
            break;
          default:
            colorInterpolator = d3.interpolateRgb("#521db9", "#00e8a2");
        }
        
        const color = d3.scaleSequential(colorDomain, colorInterpolator);

        const projection = d3.geoEqualEarth().fitExtent([[2, marginTop + 2], [width - 2, height]], { type: "Sphere" });
        const path = d3.geoPath(projection);

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        svg
            .attr("width", width)
            .attr("height", height + 80)
            .attr("viewBox", `0 0 ${width} ${height + 80}`)
            .style("max-width", "100%")
            .style("max-height", "100%")
            .style("width", "auto")
            .style("height", "auto")
            .style("background", "transparent");

        // GROUP for zoom/pan
        const svgGroup = svg.append("g");

        // SPHERE (invisible)
        svgGroup.append("path").datum({ type: "Sphere" }).attr("fill", "none").attr("stroke", "none").attr("d", path as any);

        // COUNTRIES
        const countryPaths = svgGroup.append("g").selectAll("path")
            .data(countriesData.features)
            .join("path")
            .attr("fill", (d: any) => {
                const v = valuemap.get(d.properties.name);
                return v != null ? color(v) : "#cccccc";
            })
            .attr("stroke", "#222")
            .attr("stroke-width", 0.35)
            .attr("d", path as any)
            .style("cursor", "pointer")
            .on("click", (_, d: any) => {
                const name = d.properties.name;
                const val = valuemap.get(name);
                onCountrySelect?.(name, val);
            });

        // MESH
        svgGroup.append("path")
            .datum(countryMeshData)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 0.4)
            .attr("d", path as any);

        // TOOLTIP
        const tooltipDiv = d3.select(containerRef.current)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background", "rgba(0,0,0,0.75)")
            .style("color", "white")
            .style("padding", "5px 10px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("display", "none");

        countryPaths
            .on("mouseenter", (event, d: any) => {
                const val = valuemap.get(d.properties.name);
                tooltipDiv
                    .style("display", "block")
                    .html(`<b>${d.properties.name}</b><br>${METRIC_OPTIONS.find(m => m.key === metric)?.label}: ${val?.toFixed(1) ?? "No data"}`);
                const [x, y] = d3.pointer(event);
                tooltipDiv
                    .style("left", x + 3 + "px")
                    .style("top", y + 3 + "px");
            })
            .on("mousemove", (event) => {
                const [x, y] = d3.pointer(event);

                tooltipDiv
                    .style("left", x + 3 + "px")
                    .style("top", y + 3 + "px");
            })
            .on("mouseleave", () => {
                tooltipDiv.style("display", "none");
            });

        // ZOOM + PAN with scroll and drag
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 5])
            .on("zoom", (e) => {
                svgGroup.attr("transform", e.transform);
            });

        svg.call(zoom);

        if (minVal !== undefined && maxVal !== undefined) {
            // LEGEND
            const legendWidth = 300;
            const legendHeight = 12;
            const legendGroup = svg.append("g")
                .attr("transform", `translate(${(width - legendWidth) / 2}, ${height + 25})`);

            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "legend-gradient")
                .attr("x1", "0%").attr("x2", "100%");

            const steps = 10;
            d3.range(steps).forEach(i => {
                gradient.append("stop")
                    .attr("offset", `${(i / (steps - 1)) * 100}%`)
                    .attr("stop-color", color(minVal + (i / (steps - 1)) * (maxVal - minVal)));
            });

            legendGroup.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#legend-gradient)")
                .style("stroke", "white")
                .style("stroke-width", 0.5)
                .attr("rx", 4)
                .attr("ry", 4);

            legendGroup.append("text")
                .attr("x", 0).attr("y", legendHeight + 16)
                .attr("fill", "white")
                .attr("font-size", 12)
                .text(minVal.toFixed(1));

            legendGroup.append("text")
                .attr("x", legendWidth).attr("y", legendHeight + 16)
                .attr("fill", "white")
                .attr("text-anchor", "end")
                .attr("font-size", 12)
                .text(maxVal.toFixed(1));

            legendGroup.append("text")
                .attr("x", legendWidth / 2).attr("y", -6)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size", 13)
                .text(`Scale: ${METRIC_OPTIONS.find(m => m.key === metric)?.label}`);
        }

    }, [valuemap, countriesData, countryMeshData, metric]);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
            {!hideControls && (
                <div className="absolute top-0 left-0 mb-4 z-10">
                    <label className="text-sm text-white mr-3">Select metric:</label>
                    <select
                        className="bg-gray-800 text-white p-2 rounded border border-gray-600"
                        value={metric}
                        onChange={(e) => handleMetricChange(e.target.value as keyof StudentRecord | "Count")}
                    >
                        {METRIC_OPTIONS.map((m) => (
                            <option key={m.key} value={m.key}>{m.label}</option>
                        ))}
                    </select>
                </div>
            )}
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default WorldMap;
