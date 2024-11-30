"use client";
import { DialogTitle } from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { api } from "~/trpc/react";
import { useDebounce } from "@uidotdev/usehooks";
import { type TV } from "types";
import { useRouter } from "next/navigation";

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

  // Fetching results with debounced search term
  const debouncedSearchTerm = useDebounce(term, 300);
  const {
    data = { results: [] },
    isLoading,
    isError,
  } = api.tv.search.useQuery(
    { query: debouncedSearchTerm },
    { enabled: term.length > 0 },
  );

  const router = useRouter();
  function handleSelection(el: TV): void {
    setOpen(false); // Close the dialog
    void router.push(`/tv/${el.id}`); // Suppress warning for unhandled promise
  }

  return (
    <>
      {/* CTA */}
      <p
        className="flex cursor-pointer gap-2 p-1 text-sm text-muted-foreground"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
      >
        <span> Click or </span>
        Press to search {" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
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

        <CommandList>
          {/* Empty State Logic */}
          <CommandEmpty>
            {term.length > 0 &&
              (isLoading
                ? "Searching..."
                : isError
                  ? "Some error occurred"
                  : "No results found.")}

            {/* eslint-disable-next-line */}
            <img className="mx-auto h-52" src="https://i.gifer.com/40Oj.gif" />
          </CommandEmpty>

          {/* Data Rendering Logic */}
          {Array.isArray(data?.results) && data.results.length > 0 && (
            <CommandGroup heading="Results">
              {data.results
                .filter((el) => el.poster_path)
                .map((el, index) => (
                  <CommandItem
                    key={index}
                    value={el.name}
                    onSelect={() => handleSelection(el)}
                  >
                    <Avatar className="flex items-center gap-2">
                      <AvatarImage
                        src={`https://image.tmdb.org/t/p/w500/${el.poster_path}`}
                        alt={el.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                      {el.name}
                    </Avatar>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
