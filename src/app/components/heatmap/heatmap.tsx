"use client";

import { Group } from "@visx/group";
import { HeatmapCircle } from "@visx/heatmap";
import { type Bins } from '@visx/mock-data/lib/generators/genBins';
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { type SeasonDetails } from "tmdb-ts";

// helpers
function max<T>(data: T[], value: (d: T) => number): number {
  return Math.max(...data.map(value));
}

function min<T>(data: T[], value: (d: T) => number): number {
  return Math.min(...data.map(value));
}

// constants
const background = "#28272c"
const cool1 = '#122549';
const cool2 = '#b4fbde';;
const hot1 = '#77312f';
const hot2 = '#f33d15';

const defaultMargin = { top: 20, left: 20, right: 20, bottom: 20 };
function ChartComponent(w: number, h: number, binData: Bins[], margin = defaultMargin) {
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const xScale = scaleLinear({ domain: [0, binData.length], range: [0, width], });
  const yScale = scaleLinear({ domain: [0, Math.max(...binData.map((d) => d.bins.length))], range: [0, height] });

  const colorScale = scaleLinear({ range: ['#FF0000', '#008000'], domain: [0, 10] });
  const opacityScale = scaleLinear({ domain: [0, 10], range: [0.1, 1] });

  const binWidth = width / binData.length;
  const binHeight = height / max(binData, (data) => data.bins.length);
  const radius = min([binWidth, binHeight], (d) => d) / 2;

  return (
    <>
      <svg width={w} height={h} >
        <rect x={0} y={0} width={w} height={h} rx={14} fill={background} />
        <Group top={margin.top} left={margin.left}>
          <HeatmapCircle
            data={binData}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            opacityScale={opacityScale}
            radius={radius}
            gap={4}
          >
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
  const binData = seasons.map((season, seasonIndex) => ({
    bin: seasonIndex + 1, // Season number
    bins: season.episodes.map((episode, episodeIndex) => ({
      bin: episodeIndex + 1, // Episode number
      count: episode.vote_average, // Rating value
    })),
  } as Bins));


  return (
    <>
      <ParentSize>
        {({ width, height }) =>
          ChartComponent(width, height, binData)
        }
      </ParentSize>
    </>
  );
}

export default Heatmap;
