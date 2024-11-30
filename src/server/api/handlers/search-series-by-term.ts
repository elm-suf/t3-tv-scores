import { TMDB } from "tmdb-ts";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const searchSeriesByTerm = publicProcedure
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
    const tmdb = new TMDB(apiKey);
    return await tmdb.search.tvShows({ query: input.query });
  });
