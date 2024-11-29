import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Search, TV } from "types";

export const tvSearchRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const params = new URLSearchParams(input);
      const url = `https://api.themoviedb.org/3/search/tv?${params}`;
      const apiKey = process.env["TMDB_API_TOKEN"];
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status}`);
      }

      const data = await response.json();

      return data as Search<TV>;
    }),
});
