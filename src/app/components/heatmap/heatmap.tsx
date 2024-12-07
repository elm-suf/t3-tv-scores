"use client";

import { Group } from "@visx/group";
import { HeatmapCircle } from "@visx/heatmap";
import { type Bins } from '@visx/mock-data/lib/generators/genBins';
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
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
function ChartComponent(w: number, h: number, binData: SeasonDetails[], margin = defaultMargin) {
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;


  // Given a column / season index, returns the x position of a circle cell.
  const xScale = scaleLinear({ domain: [0, binData.length], range: [0, width], });

  // Given a row / episode  index, returns the y position of a circle cell.
  const yScale = scaleLinear({ domain: [0, Math.max(...binData.map((season) => season.episodes.length))], range: [0, height] });

  const colorScale = scaleLinear({ range: ['#FF0000', '#008000'], domain: [0, 10] });
  const opacityScale = scaleLinear({ domain: [0, 10], range: [0.1, 1] });

  const binWidth = width / binData.length;
  const binHeight = height / max(binData, (season) => season.episodes.length);
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
            bins={(season) => season.episodes}
            count={(episode) => episode.vote_average}
            colorScale={colorScale}
            opacityScale={opacityScale}
            radius={radius}
            gap={4}
          >{(heatmap) =>
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
                      const debug = [
                        { row: bin.row, col: bin.column },
                        { scaleRow: { x: xScale(bin.row), y: yScale(bin.row), } },
                        { scaleColumn: { x: xScale(bin.column), y: yScale(bin.column), } },
                        { cx: bin.cx, cy: bin.cy, },
                        {
                          season: bin.bin.season_number, episode: bin.bin.episode_number,
                        }
                      ]
                      debug.forEach(i => console.debug(i))
                      // alert(JSON.stringify(debug));
                    }}
                  />
                  <text
                    key={`heatmap-circle-text-${bin.row}-${bin.column}`}
                    x={bin.cx} y={bin.cy} font-size="20" text-anchor="middle" alignment-baseline="middle" fill="black">
                    ep{bin.bin.season_number}-{bin.bin.episode_number}
                    col{bin.column}-row{bin.row}
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
          return ChartComponent(width, height, seasons)
        }}
      </ParentSize>
    </>
  );
}

export default Heatmap;
