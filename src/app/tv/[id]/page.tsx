import { CommandDialogDemo } from "~/app/components/command-dialog";
import { DarkModeToggle } from "~/app/components/dark-mode-toggle";
import { api, HydrateClient } from "~/trpc/server";

export default async function TVShowPage({
  params,
}: {
  params: { id: string };
}) {
  const { showDetails, seasons } = await api.tv.getSeriesById({
    seriesId: params.id,
  });

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col border-4">
        <div className="fixed right-4 top-4">
          <DarkModeToggle />
        </div>
        <div className="fixed bottom-4 right-4">
          <CommandDialogDemo />
        </div>

        <header className="h-12 bg-red-400">
          <h1 id="header" className="">
            {showDetails.name}
          </h1>
        </header>

        <main className="flex flex-1 bg-slate-500">
          <section
            id="left-aside"
            className="flex flex-col gap-4 border bg-green-400 p-4"
          >
            {showDetails.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500/${showDetails.poster_path}`}
                alt={showDetails.name}
                className="h-96 w-full rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="h-96 w-full rounded-lg bg-gray-200"></div>
            )}

            <div id="seasons" className="flex-1 border">
              <ul className="flex flex-col gap-2">
                {showDetails.seasons.map((season, index) => (
                  <li key={index}>
                    {index} - {season.name}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2>chart section</h2>
            {seasons.map((season, index) => (
              <div key={index}>
                {season.episodes.map((ep, idx) => (
                  <span className="border" key={idx}> {ep.vote_average} </span>
                ))}
              </div>
            ))}
          </section>
        </main>
      </div>
    </HydrateClient>
  );
}
