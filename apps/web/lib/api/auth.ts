import { apiRequest } from "./client";

export type SyncedUser = {
  id: string;
  email: string;
  displayName: string | null;
  cooldownDays: number;
  createdAt: string | Date | null;
};

export type SyncUserResponse = {
  user: SyncedUser;
  isNewUser: boolean;
};

export async function syncUserWithBackend(firebaseIdToken: string) {
  return apiRequest<SyncUserResponse>("/auth/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
}
