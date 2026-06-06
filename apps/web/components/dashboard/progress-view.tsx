"use client";

import { useQuery } from "@tanstack/react-query";
import { getSolvedHistory } from "@/lib/api/central";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Calendar, Trophy, Zap, ExternalLink, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";

function getDifficultyBadgeClass(difficulty: string) {
  if (difficulty === "Easy") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400";
  }
  if (difficulty === "Medium") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-400";
  }
  if (difficulty === "Hard") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400";
  }
  return "border-border bg-muted text-muted-foreground";
}

export function ProgressView() {
  const router = useRouter();
  const solvedQuery = useQuery({
    queryKey: ["solved-history"],
    queryFn: getSolvedHistory,
  });

  const history = solvedQuery.data ?? [];

  const easyCount = history.filter((h) => h.difficulty === "Easy").length;
  const mediumCount = history.filter((h) => h.difficulty === "Medium").length;
  const hardCount = history.filter((h) => h.difficulty === "Hard").length;
  const totalCount = history.length;

  // Group solved problems by date (day only)
  const groupedHistory = history.reduce<Record<string, typeof history>>((groups, item) => {
    const date = new Date(item.solvedAt);
    const dateStr = date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(item);
    return groups;
  }, {});

  // Sorting dates descending
  const sortedDateGroups = Object.keys(groupedHistory).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (solvedQuery.isLoading) {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </section>
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg w-full" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Overview stats cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
            <Trophy className="size-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed practice tasks</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Easy Solved</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{easyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Foundational concepts mastered</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Medium Solved</CardTitle>
            <Zap className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{mediumCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Interview standard questions</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Hard Solved</CardTitle>
            <Code2 className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{hardCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Advanced structures & optimization</p>
          </CardContent>
        </Card>
      </section>

      {/* Daily Solved Timeline */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Daily Activity History</CardTitle>
          <CardDescription>Chronological log of questions you have marked as solved</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {sortedDateGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No solved problems recorded yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px]">
                Mark problems as solved in your personal library or central playlists to populate your daily log.
              </p>
            </div>
          ) : (
            <div className="space-y-8 relative before:absolute before:inset-y-1 before:left-3.5 before:w-0.5 before:bg-border/60">
              {sortedDateGroups.map((dateStr) => (
                <div key={dateStr} className="relative pl-8 space-y-3">
                  {/* Timeline node */}
                  <div className="absolute left-1.5 top-1.5 size-4 rounded-full border border-primary bg-background flex items-center justify-center">
                    <div className="size-1.5 rounded-full bg-primary" />
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {dateStr}
                  </h4>

                  <ul className="grid gap-2">
                    {(groupedHistory[dateStr] ?? []).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-background/40 hover:bg-background/80 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary border-primary/10 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5"
                          >
                            {item.type}
                          </Badge>
                          <div className="min-w-0">
                            <button
                              onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                params.set("view", "problem");
                                params.set("problemId", item.problemId.toString());
                                params.set("from", "progress");
                                if (item.type === "central") {
                                  params.set("type", "central");
                                } else {
                                  params.delete("type");
                                }
                                router.push(`?${params.toString()}`);
                              }}
                              className="font-semibold text-sm hover:text-primary transition-colors text-left hover:underline decoration-primary/30 underline-offset-2 truncate block"
                            >
                              {item.title}
                            </button>
                            <span className="text-[10px] text-muted-foreground font-mono tracking-tight mt-0.5 block">
                              Solved at {new Date(item.solvedAt).toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Badge
                            variant="outline"
                            className={`${getDifficultyBadgeClass(item.difficulty)} border-none shadow-none font-bold text-[10px] h-5 px-2`}
                          >
                            {item.difficulty}
                          </Badge>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium hover:underline decoration-primary/30"
                          >
                            LeetCode
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
