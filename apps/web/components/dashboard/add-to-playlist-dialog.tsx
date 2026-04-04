"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import {
  addProblemToPlaylist,
  createPlaylist,
  type Playlist,
} from "@/lib/api/playlists";
import type { Problem } from "@/lib/api/problems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type AddToPlaylistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: Problem | null;
  playlists: Playlist[];
  playlistsLoading: boolean;
  isAuthenticated: boolean;
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

export function AddToPlaylistDialog({
  open,
  onOpenChange,
  problem,
  playlists,
  playlistsLoading,
  isAuthenticated,
}: AddToPlaylistDialogProps) {
  const queryClient = useQueryClient();
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedPlaylistIds([]);
      setNewPlaylistName("");
    }
  }, [open]);

  const createPlaylistMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: async (playlist) => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setSelectedPlaylistIds((current) => [...current, playlist.id]);
      setNewPlaylistName("");
      toast.success(`Created "${playlist.name}"`);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to create playlist.";
      toast.error(message);
    },
  });

  const addProblemMutation = useMutation({
    mutationFn: async ({
      playlistIds,
      problemId,
    }: {
      playlistIds: number[];
      problemId: number;
    }) => {
      return Promise.all(
        playlistIds.map((playlistId) => addProblemToPlaylist(playlistId, problemId))
      );
    },
    onSuccess: async (responses) => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });

      const alreadyExistsCount = responses.filter((r) => r.alreadyExists).length;
      const newAddCount = responses.length - alreadyExistsCount;

      if (newAddCount > 0) {
        toast.success(`Problem added to ${newAddCount} playlist(s).`);
      }

      if (alreadyExistsCount > 0) {
        toast.info(
          `${alreadyExistsCount} playlist(s) already contained this problem.`,
        );
      }

      onOpenChange(false);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to add problem to playlist.";
      toast.error(message);
    },
  });

  const togglePlaylist = (id: number) => {
    setSelectedPlaylistIds((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id],
    );
  };

  const canSubmit =
    Boolean(problem) &&
    selectedPlaylistIds.length > 0 &&
    !addProblemMutation.isPending &&
    !playlistsLoading &&
    isAuthenticated;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add To Playlist</DialogTitle>
          <DialogDescription>
            Save this problem into one or more of your learning playlists.
          </DialogDescription>
        </DialogHeader>

        {problem ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{problem.title}</p>
                <Badge
                  variant="outline"
                  className={getDifficultyBadgeClass(problem.difficulty)}
                >
                  {problem.difficulty}
                </Badge>
                {problem.category ? (
                  <Badge
                    variant="outline"
                    className="bg-background text-muted-foreground"
                  >
                    {problem.category}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-pretty">
                {problem.url}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Playlists</Label>

              <ScrollArea className="h-[200px] rounded-xl border bg-muted/30 p-4">
                {playlistsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading your playlists...
                  </p>
                ) : playlists.length > 0 ? (
                  <div className="space-y-3">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={`playlist-${playlist.id}`}
                          checked={selectedPlaylistIds.includes(playlist.id)}
                          onCheckedChange={() => togglePlaylist(playlist.id)}
                        />
                        <Label
                          htmlFor={`playlist-${playlist.id}`}
                          className="flex flex-1 items-center justify-between gap-3 text-sm font-medium cursor-pointer"
                        >
                          <span>{playlist.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {playlist.problemCount} saved
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You don’t have any playlists yet. Create one below to
                    continue.
                  </p>
                )}
              </ScrollArea>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderKanban className="size-4" />
                <p className="text-sm font-medium">Create a new playlist</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Useful if this problem belongs in a brand-new study track.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  value={newPlaylistName}
                  onChange={(event) => setNewPlaylistName(event.target.value)}
                  placeholder="e.g. Graphs Revision"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !newPlaylistName.trim() ||
                    createPlaylistMutation.isPending ||
                    !isAuthenticated
                  }
                  onClick={() =>
                    createPlaylistMutation.mutate(newPlaylistName.trim())
                  }
                >
                  <Plus />
                  Create
                </Button>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Sign in to create playlists and save problems.
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => {
              if (!problem || selectedPlaylistIds.length === 0) {
                return;
              }

              addProblemMutation.mutate({
                playlistIds: selectedPlaylistIds,
                problemId: problem.id,
              });
            }}
          >
            {addProblemMutation.isPending ? "Adding..." : "Add To Playlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
