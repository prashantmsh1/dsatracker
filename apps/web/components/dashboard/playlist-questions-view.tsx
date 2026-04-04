"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { getPlaylistQuestions } from "@/lib/api/playlists";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PlaylistQuestionsViewProps = {
  playlistId: number;
  playlistName: string;
  onBack: () => void;
};

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

export function PlaylistQuestionsView({
  playlistId,
  playlistName,
  onBack,
}: PlaylistQuestionsViewProps) {
  const questionsQuery = useQuery({
    queryKey: ["playlist-questions", playlistId],
    queryFn: () => getPlaylistQuestions(playlistId),
  });

  const questions = questionsQuery.data ?? [];

  if (questionsQuery.isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <div className="space-y-3 rounded-xl border p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon-sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Playlist</p>
            <h2 className="text-2xl font-semibold">{playlistName}</h2>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <ScrollArea className="h-[min(65vh,42rem)] rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Problem</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>LeetCode</TableHead>
                <TableHead className="text-right">Saved At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length > 0 ? (
                questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium whitespace-normal">
                      <div className="max-w-xl">
                        <p>{q.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getDifficultyBadgeClass(q.difficulty)}
                      >
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Open
                        <ExternalLink className="size-3.5" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground font-mono">
                      {new Date(q.createdAt as string).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No questions in this playlist yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </section>
    </>
  );
}
