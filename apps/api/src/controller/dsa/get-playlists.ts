import { db, playlists, playlistQuestions, eq, count } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getPlaylists = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  try {
    await ensureUserRecord(firebaseUser);

    const userPlaylists = await db
      .select({
        id: playlists.id,
        name: playlists.name,
        createdAt: playlists.createdAt,
        problemCount: count(playlistQuestions.questionId),
      })
      .from(playlists)
      .leftJoin(playlistQuestions, eq(playlistQuestions.playlistId, playlists.id))
      .where(eq(playlists.userId, firebaseUser.uid))
      .groupBy(playlists.id)
      .orderBy(playlists.createdAt);

    return c.json(
      userPlaylists.map((playlist) => ({
        ...playlist,
        problemCount: Number(playlist.problemCount ?? 0),
      })),
    );
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
