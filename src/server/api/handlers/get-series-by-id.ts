import { TMDB } from "tmdb-ts";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const getSeriesById = publicProcedure
  .input(
    z.object({
      seriesId: z.string(),
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

    // Fetch basic TV show details (without seasons)
    const showDetails = await tmdb.tvShows.details(+input.seriesId);

    console.debug(`showDetails`, showDetails);
    // Fetch seasons in parallel using Promise.all
    const seasonPromises =
      showDetails.seasons
        .filter((season) => season.season_number > 0)
        .map((season) =>
          tmdb.tvShows.season(+input.seriesId, season.season_number),
        ) || [];

    // Wait for all season data to be fetched in parallel
    const seasons = await Promise.all(seasonPromises);
    console.debug(`seasons`, seasons);

    return {
      showDetails, // Return the raw TV show details
      seasons, // Return the raw seasons data
    };
  });
