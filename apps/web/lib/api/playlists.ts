import { type Problem } from "./problems";
import { apiRequest, getAuthorizationHeader } from "./client";

export type Playlist = {
  id: number;
  name: string;
  theory: string | null;
  createdAt: string | Date | null;
  problemCount: number;
};

export type AddProblemToPlaylistResponse = {
  playlistId: number;
  problemId: number;
  questionId: number;
  alreadyExists: boolean;
};

export async function getPlaylists() {
  return apiRequest<Playlist[]>("/playlists", {
    headers: await getAuthorizationHeader(),
  });
}

export async function createPlaylist(name: string) {
  return apiRequest<Playlist>("/playlists", {
    method: "POST",
    headers: await getAuthorizationHeader(),
    body: JSON.stringify({ name }),
  });
}

export async function addProblemToPlaylist(
  playlistId: number,
  problemId: number,
) {
  return apiRequest<AddProblemToPlaylistResponse>(
    `/playlists/${playlistId}/questions`,
    {
      method: "POST",
      headers: await getAuthorizationHeader(),
      body: JSON.stringify({ problemId }),
    },
  );
}

export async function getPlaylistQuestions(playlistId: number) {
  return apiRequest<Problem[]>(`/playlists/${playlistId}/questions`, {
    headers: await getAuthorizationHeader(),
  });
}

export async function updatePlaylist(playlistId: number, data: Partial<{ name: string; theory: string }>) {
  return apiRequest<Playlist>(`/playlists/${playlistId}`, {
    method: "PATCH",
    headers: await getAuthorizationHeader(),
    body: JSON.stringify(data),
  });
}
