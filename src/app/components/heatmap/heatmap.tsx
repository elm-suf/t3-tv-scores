/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { Group } from "@visx/group";
import { HeatmapCircle } from "@visx/heatmap";
import { type Bin } from "@visx/mock-data/lib/generators/genBins";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleLog, scalePower, scaleQuantile } from "@visx/scale";
import { interpolateRdYlGn } from "d3-scale-chromatic";
import { type Episode, type SeasonDetails } from "tmdb-ts";
import {
  Legend,
  LegendLinear,
  LegendQuantile,
  LegendOrdinal,
  LegendSize,
  LegendThreshold,
  LegendItem,
  LegendLabel,
} from "@visx/legend";
import { format } from "@visx/vendor/d3-format";
import { scaleDiverging } from "@visx/vendor/d3-scale";

// Utility functions for max and min calculations
const max = <T,>(data: T[], value: (d: T) => number): number =>
  Math.max(...data.map(value));
const min = <T,>(data: T[], value: (d: T) => number): number =>
  Math.min(...data.map(value));

// Styling constants
const BACKGROUND_COLOR = "#28272c";
const COOL_COLORS = ["#122549", "#b4fbde"];
const HOT_COLORS = ["#77312f", "#f33d15"];
const DEFAULT_MARGIN = { top: 20, left: 20, right: 20, bottom: 20 };

export type HeatMapBin = Bin & Partial<Episode>;

// Helper to transform season data into bins
const getBinData = (seasons: SeasonDetails[], isDesktopView: boolean) => {
  const maxEpisodes = max(seasons, (season) => season.episodes.length);

  if (isDesktopView) {
    return Array.from({ length: maxEpisodes }, (_, epIndex) => ({
      bin: epIndex + 1,
      bins: seasons.map((season, seasonIndex) => ({
        ...season.episodes[epIndex],
        bin: seasonIndex + 1,
        count: season.episodes[epIndex]?.vote_average ?? -1,
      })),
    }));
  }

  return seasons.map((season, seasonIndex) => ({
    bin: seasonIndex + 1,
    bins: season.episodes.map((episode, episodeIndex) => ({
      ...episode,
      bin: episodeIndex + 1,
      count: episode.vote_average,
    })),
  }));
};

function LegendDemo({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`legend ${className ?? ""}`.trim()}>
      <div className="title">{title}</div>
      {children}
      <style jsx>{`
        .legend {
          line-height: 0.9em;
          color: #efefef;
          font-size: 10px;
          font-family: arial;
          padding: 10px 10px;
          float: left;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          margin: 5px 5px;
        }
        .title {
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 100;
        }
      `}</style>
    </div>
  );
}

// Chart rendering logic
const ChartComponent = (
  width: number,
  height: number,
  seasons: SeasonDetails[],
  margin = DEFAULT_MARGIN,
) => {
  const isDesktopView = width > 600;
  const binData = getBinData(seasons, isDesktopView);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = scaleLinear({
    domain: [0, binData.length],
    range: [0, chartWidth],
  });
  const yScale = scaleLinear({
    domain: [0, max(binData, (season) => season.bins.length)],
    range: [0, chartHeight],
  });

  const minMaxDomain = [
    min(binData, (data) =>
      min(
        data.bins.filter((el) => el.count !== -1),
        (item) => item.count,
      ),
    ),
    max(binData, (data) => max(data.bins, (item) => item.count)),
  ];

  const colorScale = scaleLinear({
    domain: [2, 4, 6, 8, 10],
    range: [
      "#d73027", // For value 2
      "#f46d43", // For value 4
      "#fee08b", // For value 6
      "#a6d96a", // For value 8
      "#1a9850", // For value 10
    ],
  });

  const opacityScale = scaleLinear({
    // domain: [0, 10],
    domain: minMaxDomain,
    range: [0.1, 1],
  });

  // Bin dimensions
  const binWidth = chartWidth / binData.length;
  const binHeight = chartHeight / max(binData, (season) => season.bins.length);
  const radius = min([binWidth, binHeight], (d) => d) / 2;
  // const oneDecimalFormat = format('.1f');
  const legendGlyphSize = 15;

  return (
    <>
      {isDesktopView && (
        <LegendDemo title="Legend" className="absolute right-4 top-4 w-24">
          <LegendLinear
            className="relative top-0"
            scale={colorScale}
            labelFormat={(d, i) => +d}
          >
            {(labels) => {
              console.debug(labels);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              return labels.map((label, i) => (
                <LegendItem
                  key={`legend-quantile-${i}`}
                  onClick={() => {
                    alert(`clicked: ${JSON.stringify(label)}`);
                  }}
                >
                  <svg
                    width={legendGlyphSize}
                    height={legendGlyphSize}
                    style={{ margin: "2px 0" }}
                  >
                    <circle
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                      fill={label.value}
                      r={legendGlyphSize / 2}
                      cx={legendGlyphSize / 2}
                      cy={legendGlyphSize / 2}
                    />
                  </svg>
                  <LegendLabel align="left" margin="0 4px">
                    {label.text}
                  </LegendLabel>
                </LegendItem>
              ));
            }}
          </LegendLinear>
        </LegendDemo>
      )}

      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={14}
          fill={BACKGROUND_COLOR}
        />

        <Group top={margin.top} left={margin.left}>
          <HeatmapCircle
            data={binData}
            xScale={xScale}
            yScale={yScale}
            bins={(season) => season.bins}
            count={(episode) => episode.count}
            colorScale={colorScale}
            // opacityScale={opacityScale}
            radius={radius}
            gap={4}
          >
            {(heatmap) =>
              heatmap.map((heatmapBins) =>
                heatmapBins.map((bin) => (
                  <g key={`heatmap-circle-${bin.row}-${bin.column}`}>
                    <circle
                      className="visx-heatmap-circle hover:stroke-white"
                      cx={bin.cx}
                      cy={bin.cy}
                      r={bin.r}
                      fill={bin.bin.vote_average ? bin.color : BACKGROUND_COLOR}
                      fillOpacity={bin.opacity}
                      onClick={() => {
                        alert(JSON.stringify(bin.bin));
                      }}
                    />
                    <text
                      className="pointer-events-none"
                      x={bin.cx}
                      y={bin.cy}
                      fontSize="12"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill="black"
                    >
                      {bin.bin.vote_average?.toFixed(2)}
                    </text>
                  </g>
                )),
              )
            }
          </HeatmapCircle>
        </Group>
      </svg>
    </>
  );
};

export type HeatmapProps = {
  seasons: SeasonDetails[];
};

// Main heatmap component
const Heatmap = ({ seasons = [] }: HeatmapProps) => (
  <>
    <ParentSize className="relative">
      {({ width, height }) => ChartComponent(width, height, seasons)}
    </ParentSize>
  </>
);

export default Heatmap;
