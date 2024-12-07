"use client";

import { Group } from "@visx/group";
import { HeatmapCircle } from "@visx/heatmap";
import { type Bin } from "@visx/mock-data/lib/generators/genBins";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { type Episode, type SeasonDetails } from "tmdb-ts";

// helpers
function max<T>(data: T[], value: (d: T) => number): number {
  return Math.max(...data.map(value));
}

function min<T>(data: T[], value: (d: T) => number): number {
  return Math.min(...data.map(value));
}

// constants
const background = "#28272c";
const cool1 = "#122549";
const cool2 = "#b4fbde";
const hot1 = "#77312f";
const hot2 = "#f33d15";

const defaultMargin = { top: 20, left: 20, right: 20, bottom: 20 };

export type HeatMapBin = Bin & Partial<Episode>;

function getBinData(seasons: SeasonDetails[], desktopView: boolean) {
  const maxEpisodes = max(seasons, (s) => s.episodes.length);

  if (desktopView) {
    const bins = new Array(maxEpisodes).fill(null).map((_, epIndex) => {
      return {
        bin: epIndex + 1,

        bins: new Array(seasons.length)
          .fill(null)
          .map((_, seasonIndex) => seasons[seasonIndex]?.episodes[epIndex])
          .map<HeatMapBin>((ep, seasonIndex) => ({
            ...ep,
            bin: ep?.season_number ?? seasonIndex + 1,
            count: ep?.vote_average ?? -1,
          })),
      };
    });

    return bins;
  }

  return seasons.map((season, seasonIndex) => ({
    bin: seasonIndex + 1, // Season number
    bins: season.episodes.map<HeatMapBin>((episode, episodeIndex) => ({
      bin: episodeIndex + 1, // Episode number
      count: episode.vote_average, // Rating value
      ...episode,
    })),
  }));
}

function ChartComponent(
  w: number,
  h: number,
  seasons: SeasonDetails[],
  margin = defaultMargin,
) {
  const desktopView = w > 600;

  const binData = getBinData(seasons, desktopView);

  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [0, binData.length],
    range: [0, width],
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...binData.map((season) => season.bins.length))],
    range: [0, height],
  });

  const colorScale = scaleLinear({
    range: [cool1, cool2],
    domain: [1, 10],
  });
  const opacityScale = scaleLinear({ domain: [0, 10], range: [0.1, 1] });

  const binWidth = width / binData.length;
  const binHeight = height / max(binData, (season) => season.bins.length);
  const radius = min([binWidth, binHeight], (d) => d) / 2;

  return (
    <>
      <svg width={w} height={h}>
        <rect x={0} y={0} width={w} height={h} rx={14} fill={background} />
        <Group top={margin.top} left={margin.left}>
          <HeatmapCircle
            data={binData}
            xScale={xScale}
            yScale={yScale}
            bins={(season) => season.bins}
            count={(episode) => episode.vote_average ?? -1}
            colorScale={colorScale}
            opacityScale={opacityScale}
            radius={radius}
            gap={4}
          >
            {(heatmap) =>
              heatmap.map((heatmapBins) =>
                heatmapBins.map((bin) => (
                  <>
                    <circle
                      key={`heatmap-circle-${bin.row}-${bin.column}`}
                      className="visx-heatmap-circle"
                      cx={bin.cx}
                      cy={bin.cy}
                      r={bin.r}
                      fill={bin.color}
                      fillOpacity={bin.opacity}
                      onClick={() => {
                        const data: HeatMapBin = bin.bin;
                        console.debug(data.name);
                      }}
                    />
                    <text
                      key={`heatmap-circle-text-${bin.row}-${bin.column}`}
                      x={bin.cx}
                      y={bin.cy}
                      font-size="20"
                      text-anchor="middle"
                      alignment-baseline="middle"
                      fill="black"
                    >
                      {bin.bin.vote_average?.toFixed(2)}
                    </text>
                  </>
                )),
              )
            }
          </HeatmapCircle>
        </Group>
      </svg>
    </>
  );
}

export type HeatmapProps = {
  seasons: SeasonDetails[];
};
function Heatmap({ seasons = [] }: HeatmapProps) {
  return (
    <>
      <ParentSize>
        {({ width, height }) => {
          return ChartComponent(width, height, seasons);
        }}
      </ParentSize>
    </>
  );
}

export default Heatmap;
