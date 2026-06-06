"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  ArrowLeft, 
  ExternalLink, 
  Save, 
  Check, 
  Loader2, 
  FileText, 
  BookOpen, 
  Sparkles, 
  PenTool, 
  Code,
  AlertCircle
} from "lucide-react";
import { getProblem, updateProblem } from "@/lib/api/problems";
import { getCentralProblem, updateCentralProblem } from "@/lib/api/central";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type ProblemDetailViewProps = {
  problemId: number;
  isCentral?: boolean;
  onBack: () => void;
};

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

export function ProblemDetailView({ problemId, isCentral = false, onBack }: ProblemDetailViewProps) {
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();

  // Queries & Mutations
  const { data: problem, isLoading, isError, error } = useQuery({
    queryKey: ["problem-detail", problemId, isCentral],
    queryFn: () => isCentral ? getCentralProblem(problemId) : getProblem(problemId),
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Parameters<typeof updateProblem>[1]) => 
      isCentral 
        ? updateCentralProblem(problemId, updates as any)
        : updateProblem(problemId, updates),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["problem-detail", problemId, isCentral], updatedData);
      queryClient.invalidateQueries({ queryKey: [isCentral ? "central-problems" : "problems"] });
      setNotesSavedStatus("saved");
      toast.success("Problem updated successfully");
    },
    onError: (err: Error) => {
      setNotesSavedStatus("modified");
      toast.error(`Failed to save changes: ${err.message}`);
    },
  });

  // State Management
  const [notes, setNotes] = useState("");
  const [notesSavedStatus, setNotesSavedStatus] = useState<"saved" | "saving" | "modified">("saved");

  // Sync state with fetched data
  useEffect(() => {
    if (problem) {
      setNotes(problem.notes || "");
    }
  }, [problem]);

  // Handle Ctrl + S shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveNotes();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notes]);

  const handleNotesChange = (val?: string) => {
    setNotes(val || "");
    setNotesSavedStatus("modified");
  };

  const handleSaveNotes = () => {
    if (!problem) return;
    setNotesSavedStatus("saving");
    updateMutation.mutate({ notes });
  };

  const toggleCompleted = () => {
    if (!problem) return;
    updateMutation.mutate({ completed: !problem.completed });
  };

  // Helper Template Inserts
  const insertTemplate = (type: "complexity" | "approach" | "code") => {
    let template = "";
    if (type === "complexity") {
      template = "\n### Complexity Analysis\n- **Time Complexity:** $O(N)$\n- **Space Complexity:** $O(1)$\n";
    } else if (type === "approach") {
      template = "\n### Approach / Strategy\n1. **Step 1:** Describe first step.\n2. **Step 2:** Describe second step.\n";
    } else if (type === "code") {
      template = "\n```python\nclass Solution:\n    def solve(self, nums: List[int]) -> int:\n        # Write code here\n        pass\n```\n";
    }
    setNotes((prev) => prev + template);
    setNotesSavedStatus("modified");
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-[350px] w-full" />
        </div>
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 max-w-xl mx-auto mt-10">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="size-5" />
          <h3 className="font-semibold text-lg">Failed to load problem</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : "The problem could not be found or you do not have permission."}
        </p>
        <Button onClick={onBack} variant="outline" className="mt-4 gap-2">
          <ArrowLeft className="size-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-8rem)]">
      {/* Top Header Bar */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon-sm" onClick={onBack} className="rounded-lg shrink-0">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="outline" className={`${getDifficultyBadgeClass(problem.difficulty)} border-none font-bold text-[10px] h-5 px-2`}>
                {problem.difficulty}
              </Badge>
              {problem.category && (
                <Badge variant="secondary" className="font-semibold text-[10px] h-5 px-2">
                  {problem.category}
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{problem.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={toggleCompleted}
            className={`gap-2 text-xs font-semibold h-9 rounded-lg transition-all duration-200 ${
              problem.completed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "border-border hover:bg-muted"
            }`}
          >
            <div className={`size-3.5 rounded-full border flex items-center justify-center transition-all ${
              problem.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/50"
            }`}>
              {problem.completed && <Check className="size-2.5 stroke-[4]" />}
            </div>
            {problem.completed ? "Solved" : "Mark Solved"}
          </Button>

          <Button
            variant="default"
            size="sm"
            className="gap-1.5 h-9 font-semibold text-xs rounded-lg"
            nativeButton={false}
            render={<a href={problem.url} target="_blank" rel="noreferrer" />}
          >
            <span>Solve on LeetCode</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </section>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Pane - Problem description */}
        <section className="lg:col-span-5 flex flex-col rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <FileText className="size-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Problem Description</h3>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 max-h-[calc(100vh-18rem)]">
            {problem.description ? (
              <div 
                className="text-foreground/90 text-sm leading-relaxed whitespace-normal break-words
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
                  [&_li]:mb-1
                  [&_code]:bg-muted/80 [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs [&_code]:border [&_code]:border-border/30
                  [&_pre]:bg-muted/30 [&_pre]:border [&_pre]:border-border/40 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-none [&_pre_code]:text-[13px]
                  [&_strong]:font-bold [&_strong]:text-foreground
                  [&_em]:italic
                  [&_sub]:text-[10px] [&_sub]:align-sub
                  [&_sup]:text-[10px] [&_sup]:align-super
                  [&_hr]:my-6 [&_hr]:border-border/60
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
                  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4
                  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3
                  [&_h3]:text-md [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2
                  [&_a]:text-primary [&_a]:hover:underline [&_a]:font-medium
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                  [&_th]:border [&_th]:border-border [&_th]:bg-muted/20 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold
                  [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-xs"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="size-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No description available</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px]">
                  This problem does not have a description saved.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Pane - Study notes workspace */}
        <section className="lg:col-span-7 flex flex-col rounded-xl border bg-card overflow-hidden shadow-sm">
          {/* Notes Title Header */}
          <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <BookOpen className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Study Notes Workspace</h3>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="xs"
                onClick={() => insertTemplate("approach")}
                className="text-xs gap-1 h-7 border-border/60 hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
              >
                <PenTool className="size-3" />
                + Strategy
              </Button>
              <Button 
                variant="outline" 
                size="xs"
                onClick={() => insertTemplate("complexity")}
                className="text-xs gap-1 h-7 border-border/60 hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="size-3" />
                + Complexity
              </Button>
              <Button 
                variant="outline" 
                size="xs"
                onClick={() => insertTemplate("code")}
                className="text-xs gap-1 h-7 border-border/60 hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
              >
                <Code className="size-3" />
                + Python
              </Button>
            </div>
          </div>

          {/* Markdown Editor Container */}
          <div 
            className="flex-1 w-full bg-background min-h-[400px] overflow-hidden" 
            data-color-mode={resolvedTheme as "light" | "dark" | undefined}
          >
            <MDEditor
              value={notes}
              onChange={handleNotesChange}
              preview="live"
              height="100%"
              className="border-none h-full min-h-[400px] rounded-none md-editor-workspace"
              style={{ borderRadius: 0 }}
            />
          </div>

          {/* Notes Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/10 shrink-0">
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Tip: Press <kbd className="px-1.5 py-0.5 border rounded bg-background font-mono text-[9px] shadow-sm font-bold">Ctrl + S</kbd> to quickly save changes
            </p>

            <div className="flex items-center gap-3 ml-auto">
              {/* Saved feedback state */}
              {notesSavedStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  Saving changes...
                </span>
              )}
              {notesSavedStatus === "saved" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                  <Check className="size-3.5" />
                  All changes saved
                </span>
              )}
              {notesSavedStatus === "modified" && (
                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Unsaved changes
                </span>
              )}

              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={updateMutation.isPending || notesSavedStatus === "saved"}
                className="h-8 gap-2 text-xs font-semibold px-4 shadow-sm"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-3 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      {/* Editor CSS Override */}
      <style dangerouslySetInnerHTML={{__html: `
        .md-editor-workspace .w-md-editor {
          height: 100% !important;
          box-shadow: none !important;
        }
        .md-editor-workspace .w-md-editor-content {
          height: calc(100% - 29px) !important;
        }
      `}} />
    </div>
  );
}
