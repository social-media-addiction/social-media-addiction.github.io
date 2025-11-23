import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import * as d3 from "d3";
import { renderToStaticMarkup } from "react-dom/server";

export interface BubbleDatum {
    id: string;
    value: number;
    group?: string;
}

interface BubbleChartProps {
    data: BubbleDatum[];
    width?: number;
    height?: number;
    iconMap?: Record<string, React.ReactNode>; // ★ NEW
}

const BubbleChart: React.FC<BubbleChartProps> = ({ data, width, height, iconMap }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: width || containerRef.current.offsetWidth,
                    height: height || containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();

        const observer = new ResizeObserver(updateDimensions);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const width = dimensions.width;
        const height = dimensions.height;
        const margin = 5;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const color = d3
            .scaleOrdinal<string>()
            .domain(data.map((d) => d.group || d.id))
            .range(["#ee5975ff", "#38bdf8", "#141417ff", "#ee615aff", "#38bdf8", "#223485ff", "#d99a41ff", "#54c776ff", "#d99a41ff", "#38bdf8", "#54c776ff", "#54c776ff"]);

        // PACK LAYOUT
        const pack = d3.pack<BubbleDatum>()
            .size([width - margin * 2, height - margin * 2])
            .padding(5);

        const rawHierarchy = d3
            .hierarchy<{ children?: BubbleDatum[] } | BubbleDatum>({ children: data } as any)
            .sum((d: any) => ("value" in d ? (d as BubbleDatum).value : 0));

        const root = pack(rawHierarchy as unknown as d3.HierarchyNode<BubbleDatum>);

        const nodes = svg.append("g")
            .attr("transform", `translate(${margin}, ${margin})`)
            .selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .style("cursor", "pointer");

        // TOOLTIP
        const tooltip = svg.append("g")
            .attr("class", "bubble-tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("rx", 6)
            .attr("fill", "rgba(31,41,55,0.95)")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5);

        tooltip.append("text")
            .attr("fill", "#69b3a2")
            .attr("font-size", 13)
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle");

        // CIRCLES
        nodes.append("circle")
            .attr("r", (d) => d.r)
            .attr("fill-opacity", 0.72)
            .attr("fill", (d) => color(d.data.group || d.data.id) as string)
            .attr("stroke", "rgba(255,255,255,0.4)")
            .attr("stroke-width", 2)
            .on("mouseover", function (_, d) {
                d3.select(this).transition().duration(200).attr("opacity", 0.8);

                tooltip.select("text").text(`${d.data.id}: ${d.data.value}`);

                const textNode = tooltip.select("text").node() as SVGTextElement;
                const textWidth = textNode.getBBox().width;

                tooltip.select("rect")
                    .attr("width", textWidth + 16)
                    .attr("height", 30)
                    .attr("x", -(textWidth / 2) - 8)
                    .attr("y", -22);

                tooltip.style("display", "block");
            })
            .on("mousemove", function (event) {
                tooltip.attr("transform", `translate(${event.offsetX}, ${event.offsetY - 20})`);
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(200).attr("opacity", 1);
                tooltip.style("display", "none");
            });

        // LABELS
        nodes.append("text")
            .attr("fill", "white")
            .attr("font-size", (d) => Math.min(d.r / 3, 16))
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .text((d) => d.data.id);

        // -------------------------------------------------------
        // ★ ICONS (same technique as your BarChart foreignObject)
        // -------------------------------------------------------
        if (iconMap) {
            nodes.each(function (d) {
                const icon = iconMap[d.data.id];
                if (!icon) return;

                const markup = renderToStaticMarkup(icon as React.ReactElement);

                d3.select(this)
                    .append("foreignObject")
                    .attr("class", "bubble-icon")
                    .attr("width", d.r)
                    .attr("height", d.r)
                    .attr("x", -d.r / 2)
                    .attr("y", -(d.r / 2) - 10) // shift slightly upward
                    .style("overflow", "visible")
                    .html(`
                        <div style="
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
                        ">
                            ${markup}
                        </div>
                    `);
            });
        }

    }, [data, dimensions, iconMap]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "500px" }}>
            <svg ref={svgRef} width="100%" height="100%" />
        </div>
    );
};

export default BubbleChart;
