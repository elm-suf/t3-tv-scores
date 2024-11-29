import { HydrateClient } from "~/trpc/server";
import { CommandDialogDemo } from "./components/command-dialog";
import { DarkModeToggle } from "./components/dark-mode-toggle";

export default async function Home() {
  // void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 border-4 p-4 text-center">
        <div className="fixed top-4 right-4" >

        <DarkModeToggle  />
        </div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Uncover the Best of TV, One Episode at a Time.
        </h1>
        <p className="text-muted-foreground text-xl">
          Discover episode ratings at a glance and find your next binge-worthy
          series.
        </p>

        <CommandDialogDemo  />
      </main>
    </HydrateClient>
  );
}
