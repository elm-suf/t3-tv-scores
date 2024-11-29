import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const tvSearchRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      return {
        "search-series": `Hello ${input.query}`,
      };
    }),
});
