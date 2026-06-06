import { db, centralPlaylists, centralPlaylistProblems, eq, count } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getCentralPlaylists = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  try {
    await ensureUserRecord(firebaseUser);

    const playlists = await db
      .select({
        id: centralPlaylists.id,
        name: centralPlaylists.name,
        theory: centralPlaylists.theory,
        createdAt: centralPlaylists.createdAt,
        problemCount: count(centralPlaylistProblems.problemId),
      })
      .from(centralPlaylists)
      .leftJoin(centralPlaylistProblems, eq(centralPlaylistProblems.playlistId, centralPlaylists.id))
      .groupBy(centralPlaylists.id)
      .orderBy(centralPlaylists.createdAt);

    return c.json(
      playlists.map((playlist) => ({
        ...playlist,
        problemCount: Number(playlist.problemCount ?? 0),
      })),
    );
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
