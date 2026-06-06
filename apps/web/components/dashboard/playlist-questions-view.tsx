"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ExternalLink, ArrowLeft, BookOpen, Edit3, Save, X } from "lucide-react";
import { getPlaylistQuestions, updatePlaylist } from "@/lib/api/playlists";
import { getCentralPlaylistQuestions } from "@/lib/api/central";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import dynamic from "next/dynamic";
import { toast } from "sonner";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

type PlaylistQuestionsViewProps = {
  playlistId: number;
  playlistName: string;
  theory: string;
  isCentral?: boolean;
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
  theory: initialTheory,
  isCentral = false,
  onBack,
}: PlaylistQuestionsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  const [isEditingTheory, setIsEditingTheory] = useState(false);
  const [theoryDraft, setTheoryDraft] = useState(initialTheory);

  const handleViewProblem = (problemId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "problem");
    params.set("problemId", problemId.toString());
    params.set("from", "playlist");
    params.set("playlistId", playlistId.toString());
    if (isCentral) {
      params.set("type", "central");
    } else {
      params.delete("type");
    }
    router.push(`?${params.toString()}`);
  };

  // Sync draft if initialTheory changes
  useEffect(() => {
    setTheoryDraft(initialTheory);
  }, [initialTheory]);

  const questionsQuery = useQuery({
    queryKey: ["playlist-questions", playlistId, isCentral],
    queryFn: () => isCentral ? getCentralPlaylistQuestions(playlistId) : getPlaylistQuestions(playlistId),
  });

  const updateMutation = useMutation({
    mutationFn: (newTheory: string) => updatePlaylist(playlistId, { theory: newTheory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setIsEditingTheory(false);
      toast.success("Theory updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update theory: ${error.message}`);
    },
  });

  const questions = questionsQuery.data ?? [];

  const handleSaveTheory = () => {
    updateMutation.mutate(theoryDraft);
  };

  const handleCancelEdit = () => {
    setTheoryDraft(initialTheory);
    setIsEditingTheory(false);
  };

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
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon-sm" onClick={onBack} className="rounded-lg">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mb-0.5">Current Playlist</p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{playlistName}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Theory Section */}
      <section className="rounded-xl border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:border-primary/20">
        <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <BookOpen className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Theory & Notes</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Capture concepts, formulas, and strategies here</p>
            </div>
          </div>
          {!isEditingTheory ? (
            !isCentral ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingTheory(true)}
                className="h-8 gap-2 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Edit3 className="size-3.5" />
                Edit Theory
              </Button>
            ) : null
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancelEdit}
                className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveTheory}
                disabled={updateMutation.isPending}
                className="h-8 gap-2 text-xs font-semibold px-4 shadow-sm"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="p-0">
          {isEditingTheory ? (
            <div 
              className="w-full" 
              data-color-mode={resolvedTheme as "light" | "dark" | undefined}
            >
              <MDEditor
                value={theoryDraft}
                onChange={(val) => setTheoryDraft(val || "")}
                preview="live"
                height={400}
                className="border-none rounded-none"
                style={{ borderRadius: 0 }}
              />
            </div>
          ) : (
            <div 
              className="px-6 py-8 min-h-[120px]"
              data-color-mode={resolvedTheme as "light" | "dark" | undefined}
            >
              {initialTheory ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MDPreview source={initialTheory} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-12 bg-muted/30 rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="size-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No theory documented yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-[240px]">
                    {isCentral 
                      ? "This central playlist does not have any theory associated with it." 
                      : "Documentation helps in long-term retention of DSA patterns."}
                  </p>
                  {!isCentral && (
                    <Button 
                      variant="link" 
                      onClick={() => setIsEditingTheory(true)}
                      className="mt-2 text-primary h-auto p-0"
                    >
                      Start writing now
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Problems Table */}
      <section className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b bg-muted/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Problems ({questions.length})</h3>
            <p className="text-[11px] text-muted-foreground font-medium">Master these questions to clear this topic</p>
          </div>
        </div>
        <ScrollArea className="h-[min(65vh,42rem)]">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[50%] px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Problem</TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Difficulty</TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">LeetCode</TableHead>
                <TableHead className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Saved At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length > 0 ? (
                questions.map((q) => (
                  <TableRow key={q.id} className="group transition-colors hover:bg-muted/20">
                    <TableCell className="font-medium px-6 py-3.5">
                      <div className="max-w-xl">
                        <button
                          onClick={() => handleViewProblem(q.id)}
                          className="text-sm text-foreground/90 font-semibold text-left transition-colors hover:text-primary hover:underline cursor-pointer decoration-primary/30 underline-offset-2"
                        >
                          {q.title}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <Badge
                        variant="outline"
                        className={`${getDifficultyBadgeClass(q.difficulty)} border-none shadow-none font-bold text-[10px] h-5 px-2`}
                      >
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4"
                      >
                        Link
                        <ExternalLink className="size-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right px-6 py-3.5 text-[11px] text-muted-foreground/80 font-mono tracking-tight">
                      {new Date(q.createdAt as string).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                      <p className="text-sm font-medium">No questions in this playlist yet.</p>
                      <p className="text-xs mt-1">Add problems from the dashboard to see them here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </section>
    </div>
  );
}
