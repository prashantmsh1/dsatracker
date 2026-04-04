import { apiRequest, getAuthorizationHeader } from "./client";

export type Problem = {
  id: number;
  title: string;
  url: string;
  difficulty: string;
  category: string | null;
  completed: boolean | null;
  notes: string | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
};

export async function getProblems() {
  return apiRequest<Problem[]>("/problems", {
    headers: await getAuthorizationHeader(),
  });
}

export async function addProblem(problem: Omit<Problem, "id" | "createdAt" | "updatedAt">) {
  return apiRequest<Problem>("/problems", {
    method: "POST",
    headers: await getAuthorizationHeader(),
    body: JSON.stringify(problem),
  });
}
