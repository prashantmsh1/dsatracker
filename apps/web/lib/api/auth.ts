import { apiRequest, getAuthorizationHeader } from "./client";

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

export type UserSettings = {
  email: string;
  displayName: string | null;
  theme: string;
  preferredDifficulty: string;
  dailyTarget: number;
  weeklyGoal: number;
  cooldownDays: number;
};

export async function syncUserWithBackend(firebaseIdToken: string) {
  return apiRequest<SyncUserResponse>("/auth/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
}

export async function getUserSettings() {
  return apiRequest<UserSettings>("/auth/settings", {
    headers: await getAuthorizationHeader(),
  });
}

export async function updateUserSettings(settings: Partial<UserSettings>) {
  return apiRequest<UserSettings>("/auth/settings", {
    method: "PATCH",
    headers: await getAuthorizationHeader(),
    body: JSON.stringify(settings),
  });
}

