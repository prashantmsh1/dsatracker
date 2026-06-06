import { apiRequest, getAuthorizationHeader } from "./client";
import { type Problem } from "./problems";
import { type Playlist } from "./playlists";

export type SolvedHistoryItem = {
  id: number;
  problemId: number;
  type: 'user' | 'central';
  title: string;
  url: string;
  difficulty: string;
  solvedAt: string;
};

export async function getCentralProblems() {
  return apiRequest<Problem[]>("/central/problems", {
    headers: await getAuthorizationHeader(),
  });
}

export async function getCentralProblem(id: number) {
  return apiRequest<Problem>(`/central/problems/${id}`, {
    headers: await getAuthorizationHeader(),
  });
}

export async function updateCentralProblem(
  id: number,
  data: Partial<Pick<Problem, "completed" | "notes">>
) {
  return apiRequest<Partial<Problem>>(`/central/problems/${id}`, {
    method: "PATCH",
    headers: await getAuthorizationHeader(),
    body: JSON.stringify(data),
  });
}

export async function getCentralPlaylists() {
  return apiRequest<Playlist[]>("/central/playlists", {
    headers: await getAuthorizationHeader(),
  });
}

export async function getCentralPlaylistQuestions(playlistId: number) {
  return apiRequest<Problem[]>(`/central/playlists/${playlistId}/questions`, {
    headers: await getAuthorizationHeader(),
  });
}

export async function getSolvedHistory() {
  return apiRequest<SolvedHistoryItem[]>("/solved-history", {
    headers: await getAuthorizationHeader(),
  });
}
