import { TMDB, type TvShowDetails } from "tmdb-ts";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const getSeriesById = publicProcedure
  .input(
    z.object({
      seriesId: z.number(),
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

    const showDetails = (await tmdb.tvShows.details(
      input.seriesId,
    )) as TvShowDetails;

    const seasonPromises =
      showDetails.seasons
        .filter((season) => season.season_number > 0)
        .map((season) =>
          tmdb.tvShows.season(+input.seriesId, season.season_number),
        ) || [];

    const seasons = await Promise.all(seasonPromises);

    seasons.forEach((season) => {
      season.episodes.forEach((ep) => {
        ep.crew = [];
        ep.guest_stars = [];
      });
    });

    return {
      showDetails,
      seasons,
    };
  });
