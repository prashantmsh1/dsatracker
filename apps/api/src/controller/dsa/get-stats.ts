import { db, playlists, questions, eq, count } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getStats = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  try {
    await ensureUserRecord(firebaseUser);

    // 1. Total Playlists
    const [playlistsResult] = await db
      .select({ count: count() })
      .from(playlists)
      .where(eq(playlists.userId, firebaseUser.uid));

    // 2. Total Tracked Questions
    const [questionsResult] = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.userId, firebaseUser.uid));

    // 3. Solved Problems (Assuming for now its total questions tracked, eventually filter by completion)
    // For now, let's just return what's available
    const stats = {
      totalSolved: questionsResult.count || 0,
      totalPlaylists: playlistsResult.count || 0,
      activeStreak: 12, // TODO: Implement real streak logic
      hint: "+8 this week",
    };

    return c.json(stats);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
