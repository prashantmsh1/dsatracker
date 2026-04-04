import { apiRequest, getAuthorizationHeader } from "./client";

export type DashboardStats = {
  totalSolved: number;
  totalPlaylists: number;
  activeStreak: number;
  hint: string;
};

export type DailyPlanProblem = {
  id: number;
  title: string;
  url: string;
  difficulty: string;
  type: "Solve" | "Review" | "Revise";
};

export async function getDashboardStats() {
  return apiRequest<DashboardStats>("/dashboard/stats", {
    headers: await getAuthorizationHeader(),
  });
}

export async function getDailyPlan() {
  return apiRequest<DailyPlanProblem[]>("/dashboard/daily-plan", {
    headers: await getAuthorizationHeader(),
  });
}
