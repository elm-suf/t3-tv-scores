import { CommandDialogDemo } from "~/app/components/command-dialog";
import { DarkModeToggle } from "~/app/components/dark-mode-toggle";
import Heatmap from "~/app/components/heatmap/heatmap";
import { api, HydrateClient } from "~/trpc/server";

export default async function TVShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params promise to get the actual id
  const { id } = await params;

  // Fetching the data using the series ID from params
  const { showDetails, seasons } = await api.tv.getSeriesById({
    seriesId: +id,
  });

  return (
    <HydrateClient>
      <div className="fixed right-4 top-4">
        <DarkModeToggle />
      </div>
      <div className="fixed bottom-4 right-4">
        <CommandDialogDemo />
      </div>

      <div className="flex min-h-screen flex-col border-4">
        <header className="flex h-16 items-center border pl-4">
          <h1
            id="header"
            className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
          >
            {showDetails.name}
          </h1>
        </header>

        <main className="flex flex-1">
          <section
            id="left-aside"
            className="flex  w-1/5 min-w-72 max-w-md flex-col gap-4 border-r p-4"
          >
            {showDetails.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500/${showDetails.poster_path}`}
                alt={showDetails.name}
                className=" aspect-square w-full rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="h-96 w-full rounded-lg bg-gray-200"></div>
            )}

            <div id="seasons" className="flex-1">
              <ul className="flex flex-col gap-2">
                {showDetails.seasons.map((season, index) => (
                  <li key={index}>
                    {index} - {season.name}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="flex max-h-[90vh] flex-1 flex-col gap-4 p-4 pb-8">
            <div className="flex items-center justify-center">
              <h2 className="">chart section</h2>
            </div>
            <Heatmap seasons={seasons} />
          </section>
        </main>
      </div>
    </HydrateClient>
  );
}
