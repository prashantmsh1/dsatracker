"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FolderPlus, Search } from "lucide-react";
import { getPlaylists } from "@/lib/api/playlists";
import { getProblems } from "@/lib/api/problems";
import { getCentralProblems } from "@/lib/api/central";
import { useAuth } from "@/context/AuthContext";
import { AddToPlaylistDialog } from "@/components/dashboard/add-to-playlist-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getDifficultyBadgeClass(difficulty: string) {
  if (difficulty === "Easy") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (difficulty === "Medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (difficulty === "Hard") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-border bg-muted text-muted-foreground";
}

export function ProblemsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"my" | "central">("my");
  const deferredSearchValue = useDeferredValue(searchValue);

  const handleViewProblem = (problemId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "problem");
    params.set("problemId", problemId.toString());
    params.set("from", "problems");
    if (activeTab === "central") {
      params.set("type", "central");
    } else {
      params.delete("type");
    }
    router.push(`?${params.toString()}`);
  };

  const problemsQuery = useQuery({
    queryKey: ["problems"],
    queryFn: getProblems,
    enabled: activeTab === "my",
  });

  const centralProblemsQuery = useQuery({
    queryKey: ["central-problems"],
    queryFn: getCentralProblems,
    enabled: activeTab === "central",
  });

  const playlistsQuery = useQuery({
    queryKey: ["playlists"],
    queryFn: getPlaylists,
    enabled: Boolean(user),
  });

  const normalizedSearchValue = deferredSearchValue.trim().toLowerCase();
  const problems = activeTab === "my" ? (problemsQuery.data ?? []) : (centralProblemsQuery.data ?? []);
  const visibleProblems = problems.filter((problem) => {
    if (!normalizedSearchValue) {
      return true;
    }

    return [
      problem.title,
      problem.difficulty,
      problem.category ?? "",
      problem.url,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearchValue);
  });
  const selectedProblem =
    visibleProblems.find((problem) => problem.id === selectedProblemId) ??
    problems.find((problem) => problem.id === selectedProblemId) ??
    null;

  const isLoading = activeTab === "my" ? problemsQuery.isLoading : centralProblemsQuery.isLoading;
  const isError = activeTab === "my" ? problemsQuery.isError : centralProblemsQuery.isError;
  const errorObj = activeTab === "my" ? problemsQuery.error : centralProblemsQuery.error;
  const refetch = activeTab === "my" ? () => problemsQuery.refetch() : () => centralProblemsQuery.refetch();

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="space-y-3 rounded-xl border p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    const message =
      errorObj instanceof Error
        ? errorObj.message
        : "Unable to load problems right now.";

    return (
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="text-base font-semibold">Couldn&apos;t load problems</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={refetch}
        >
          Try Again
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Problems library</p>
            <h2 className="mt-1 text-2xl font-semibold">
              Browse and save practice problems
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Search across the global problem bank, then drop any problem into
              one of your playlists.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-xl border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Problems
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {problems.length}
              </p>
            </div>
            <div className="rounded-xl border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Playlists
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {user ? (playlistsQuery.data?.length ?? 0) : "Sign in"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <div className="flex border-b border-border mb-5 pb-[2px] gap-6">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-1 py-2 text-sm font-semibold border-b-2 -mb-[4px] transition-colors cursor-pointer ${
              activeTab === "my"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Problems
          </button>
          <button
            onClick={() => setActiveTab("central")}
            className={`px-1 py-2 text-sm font-semibold border-b-2 -mb-[4px] transition-colors cursor-pointer ${
              activeTab === "central"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Central Problems
          </button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search title, difficulty, category, or URL"
              className="h-10 pl-9"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {visibleProblems.length} of {problems.length} problems
          </p>
        </div>

        <ScrollArea className="mt-5 h-[min(65vh,42rem)] rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[36%]">Problem</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>LeetCode</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProblems.length > 0 ? (
                visibleProblems.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell className="font-medium whitespace-normal">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProblem(problem.id)}
                            className="text-left font-semibold text-foreground/90 hover:text-primary transition-colors cursor-pointer hover:underline decoration-primary/30 underline-offset-2"
                          >
                            {problem.title}
                          </button>
                          {problem.completed && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-none font-bold text-[9px] h-4 py-0 px-1 shrink-0">
                              Solved
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Problem #{problem.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getDifficultyBadgeClass(problem.difficulty)}
                      >
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {problem.category ?? "Uncategorized"}
                    </TableCell>
                    <TableCell>
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Open
                        <ExternalLink className="size-3.5" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      {activeTab === "my" ? (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedProblemId(problem.id)}
                          disabled={authLoading}
                        >
                          <FolderPlus />
                          Add To Playlist
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-medium px-3">Central Problem</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No problems matched your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </section>

      <AddToPlaylistDialog
        open={selectedProblemId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProblemId(null);
          }
        }}
        problem={selectedProblem}
        playlists={playlistsQuery.data ?? []}
        playlistsLoading={playlistsQuery.isLoading}
        isAuthenticated={Boolean(user)}
      />
    </>
  );
}
