import { createTRPCRouter, publicProcedure } from "../trpc";
import { type Search, type TV } from "types";
import { z } from "zod";

export const tvSearchRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = process.env.TMDB_API_TOKEN;
      if (!apiKey) {
        throw new Error(
          "TMDB_API_TOKEN is not defined in the environment variables.",
        );
      }

      const params = new URLSearchParams({ query: input.query });
      const url = `https://api.themoviedb.org/3/search/tv?${params}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status}`);
      }

      const data = (await response.json()) as Search<TV>;

      return data;
    }),
});
