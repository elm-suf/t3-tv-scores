import { getSeriesById } from "../handlers/get-series-by-id";
import { searchSeriesByTerm } from "../handlers/search-series-by-term";
import { createTRPCRouter } from "../trpc";

export const tvSearchRouter = createTRPCRouter({
  search: searchSeriesByTerm,
  getSeriesById: getSeriesById,
});
