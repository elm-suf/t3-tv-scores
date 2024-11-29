"use client";
import { DialogTitle } from "@radix-ui/react-dialog";
import * as React from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { api } from "~/trpc/react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

export function CommandDialogDemo() {
  const [term, setTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Handling keyboard shortcut for toggling dialog
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLocaleLowerCase() === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data, isLoading, isError } = api.tv.search.useQuery(
    { query: term },
    { enabled: term.length > 0 }, // Query runs only if term is not empty
  );

  return (
    <>
      {/* CTA */}
      <p
        className="text-muted-foreground cursor-pointer text-sm"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
      >
        <span> Click or </span>
        Press{" "}
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>J
        </kbd>
      </p>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden.Root>
          <DialogTitle>Search Command</DialogTitle>
        </VisuallyHidden.Root>

        <CommandInput
          placeholder="Type a command or search..."
          value={term}
          onValueChange={setTerm}
        />

        {term.length > 0 && (
          <CommandList>
            {/* Empty State Logic */}
            <CommandEmpty>
              {isLoading
                ? "Searching..."
                : isError
                  ? "Some error occurred"
                  : "No results found."}
            </CommandEmpty>

            {/* Data Rendering Logic */}
            {data && data.results && data.results.length > 0 && (
              <CommandGroup heading="Results">
                {data.results
                  .filter((el) => el.poster_path) // Only show results with poster images
                  .map((_, index) => (
                    <CommandItem key={index} value={_.name}>
                      <Avatar className="flex items-center gap-2">
                        <AvatarImage
                          src={`https://image.tmdb.org/t/p/w500/${_.poster_path}`}
                          alt={_.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                        {_.name}
                      </Avatar>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </CommandDialog>
    </>
  );
}
