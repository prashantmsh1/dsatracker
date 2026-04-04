import { db, playlists, playlistQuestions, questions, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getPlaylistQuestions = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const playlistId = Number(c.req.param("id"));

  if (!Number.isInteger(playlistId) || playlistId <= 0) {
    return c.json({ error: "Invalid playlist id" }, 400);
  }

  try {
    await ensureUserRecord(firebaseUser);

    // 1. Verify playlist existence and ownership
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, firebaseUser.uid)))
      .limit(1);

    if (!playlist) {
      return c.json({ error: "Playlist not found" }, 404);
    }

    // 2. Fetch questions for the playlist
    const result = await db
      .select({
        id: questions.id,
        title: questions.title,
        url: questions.leetcodeUrl,
        difficulty: questions.difficultyLevel,
        category: questions.category,
        completed: questions.completed,
        notes: questions.notes,
        createdAt: questions.createdAt,
      })
      .from(playlistQuestions)
      .innerJoin(questions, eq(playlistQuestions.questionId, questions.id))
      .where(eq(playlistQuestions.playlistId, playlistId));

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
