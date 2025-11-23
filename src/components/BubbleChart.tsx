import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import * as d3 from "d3";
import { renderToStaticMarkup } from "react-dom/server";
import { socialMediaColors } from "../components/SocialMediaColors";

export interface BubbleDatum {
    id: string;
    value: number;
    group?: string;
}

interface BubbleChartProps {
    data: BubbleDatum[];
    width?: number;
    height?: number;
    iconMap?: Record<string, React.ReactNode>;
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
        const obs = new ResizeObserver(updateDimensions);
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height) return;

        const width = dimensions.width;
        const height = dimensions.height;
        const margin = 5;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();


        const color = (id: string) =>
            socialMediaColors[id] || "#8884d8";  // fallback


        const pack = d3.pack<BubbleDatum>()
            .size([width - margin * 2, height - margin * 2])
            .padding(5);

        const root = pack(
            d3.hierarchy({ children: data } as any)
                .sum((d: any) => d.value)
        );

        
        const nodes = svg.append("g")
            .attr("transform", `translate(${margin}, ${margin})`)
            .selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .style("cursor", "pointer");

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

        nodes.append("circle")
            .attr("r", (d) => d.r)
            .attr("fill-opacity", 0.8)
            .attr("fill", (d) => color(d.data.id))  // ★ UPDATED
            .attr("stroke", "rgba(255,255,255,0.4)")
            .attr("stroke-width", 2)
            .on("mouseover", function (_, d) {
                d3.select(this).transition().duration(200).attr("opacity", 0.8);

                tooltip.select("text").text(`${d.data.id}: ${d.data.value}`);

                const textNode = tooltip.select("text").node() as SVGGraphicsElement | null;
                const textWidth = textNode ? textNode.getBBox().width : 60;

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


        nodes.append("text")
            .attr("fill", "white")
            .attr("font-size", (d) => Math.min(d.r / 3, 16))
            .attr("text-anchor", "middle")
            .attr("dy", "1.2em")
            .text((d) => d.data.id);

        // -----------------------------
        // ICONS
        // -----------------------------
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
                    .attr("y", -d.r / 2 - 12)
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
