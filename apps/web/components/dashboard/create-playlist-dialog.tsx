"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, Type } from "lucide-react";
import { toast } from "sonner";
import { createPlaylist } from "@/lib/api/playlists";
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

type CreatePlaylistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
};

export function CreatePlaylistDialog({
  open,
  onOpenChange,
  isAuthenticated,
}: CreatePlaylistDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const resetForm = () => {
    setName("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      return createPlaylist(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist created successfully!");
      handleOpenChange(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to create playlist.";
      toast.error(message);
    },
  });

  const canSubmit =
    name.trim() &&
    !createPlaylistMutation.isPending &&
    isAuthenticated;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (canSubmit) {
      createPlaylistMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="size-5 text-primary" />
              Create New Playlist
            </DialogTitle>
            <DialogDescription>
              Organize your study path with a custom playlist.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Type className="size-4 text-muted-foreground" />
                Playlist Name
              </Label>
              <Input
                id="name"
                autoFocus
                placeholder="e.g., Blind 75, Graphs, Dynamic Programming"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            {!isAuthenticated && (
              <p className="mr-auto text-sm text-amber-600">
                Please sign in to create playlists.
              </p>
            )}
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
            >
              {createPlaylistMutation.isPending ? "Creating..." : "Create Playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
