"use client";

import { useMutation } from "@tanstack/react-query";
import { syncUserWithBackend } from "../lib/api/auth";
import { auth } from "../lib/firebase";

type SyncUserMutationInput = {
  forceRefreshToken?: boolean;
};

export function useSyncUserMutation() {
  return useMutation({
    mutationFn: async ({ forceRefreshToken = false }: SyncUserMutationInput = {}) => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("No authenticated Firebase user found for sync");
      }

      const token = await currentUser.getIdToken(forceRefreshToken);
      return syncUserWithBackend(token);
    },
  });
}
