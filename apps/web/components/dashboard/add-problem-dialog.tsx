"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Globe, Type, BarChart, Tag, FileText } from "lucide-react";
import { toast } from "sonner";
import { addProblem } from "@/lib/api/problems";
import { addProblemToPlaylist, type Playlist } from "@/lib/api/playlists";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

type AddProblemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlists: Playlist[];
  playlistsLoading: boolean;
  isAuthenticated: boolean;
};

export function AddProblemDialog({
  open,
  onOpenChange,
  playlists,
  playlistsLoading,
  isAuthenticated,
}: AddProblemDialogProps) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>([]);

  const resetForm = () => {
    setUrl("");
    setTitle("");
    setDifficulty("Medium");
    setCategory("");
    setNotes("");
    setSelectedPlaylistIds([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const addProblemMutation = useMutation({
    mutationFn: async () => {
      // 1. Add problem to global bank
      const problem = await addProblem({
        title,
        url,
        difficulty,
        category: category || null,
        notes: notes || null,
        completed: false,
      });

      // 2. Add to each selected playlist
      if (selectedPlaylistIds.length > 0) {
        await Promise.all(
          selectedPlaylistIds.map((playlistId) =>
            addProblemToPlaylist(playlistId, problem.id)
          )
        );
      }

      return problem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Problem added successfully!");
      handleOpenChange(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to add problem.";
      toast.error(message);
    },
  });

  const togglePlaylist = (id: number) => {
    setSelectedPlaylistIds((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
    );
  };

  const canSubmit =
    title.trim() &&
    url.trim() &&
    difficulty &&
    !addProblemMutation.isPending &&
    isAuthenticated;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Problem</DialogTitle>
          <DialogDescription>
            Enter the details of the problem you want to track.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                LeetCode URL
              </Label>
              <Input
                id="url"
                placeholder="https://leetcode.com/problems/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Type className="size-4 text-muted-foreground" />
                Problem Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="flex items-center gap-2">
                  <BarChart className="size-4 text-muted-foreground" />
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={(val) => setDifficulty(val || "Medium")}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="size-4 text-muted-foreground" />
                  Category
                </Label>
                <Input
                  id="category"
                  placeholder="e.g. Array"
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Key patterns or tricks..."
                className="h-24 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Plus className="size-4 text-muted-foreground" />
              Add to Playlists
            </Label>
            <ScrollArea className="h-[280px] rounded-xl border bg-muted/30 p-4">
              {playlistsLoading ? (
                <p className="text-sm text-muted-foreground">Loading playlists...</p>
              ) : playlists.length > 0 ? (
                <div className="space-y-3">
                  {playlists.map((p) => (
                    <div key={p.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`playlist-${p.id}`}
                        checked={selectedPlaylistIds.includes(p.id)}
                        onCheckedChange={() => togglePlaylist(p.id)}
                      />
                      <Label
                        htmlFor={`playlist-${p.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {p.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({p.problemCount} problems)
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No playlists found. You can create them in the Playlists section.
                </p>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          {!isAuthenticated && (
            <p className="mr-auto text-sm text-amber-600">
              Please sign in to save problems.
            </p>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => addProblemMutation.mutate()}
          >
            {addProblemMutation.isPending ? "Adding..." : "Save Problem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
