import { db, centralPlaylists, centralPlaylistProblems, centralProblems, userCentralProblems, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getCentralPlaylistQuestions = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const playlistId = Number(c.req.param("id"));

  if (!Number.isInteger(playlistId) || playlistId <= 0) {
    return c.json({ error: "Invalid playlist id" }, 400);
  }

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  try {
    await ensureUserRecord(firebaseUser);

    // 1. Verify central playlist existence
    const [playlist] = await db
      .select()
      .from(centralPlaylists)
      .where(eq(centralPlaylists.id, playlistId))
      .limit(1);

    if (!playlist) {
      return c.json({ error: "Central Playlist not found" }, 404);
    }

    // 2. Fetch central problems for the playlist with user specific completion/notes
    const result = await db
      .select({
        id: centralProblems.id,
        title: centralProblems.title,
        url: centralProblems.leetcodeUrl,
        difficulty: centralProblems.difficultyLevel,
        category: centralProblems.category,
        completed: userCentralProblems.completed,
        notes: userCentralProblems.notes,
        createdAt: centralProblems.createdAt,
      })
      .from(centralPlaylistProblems)
      .innerJoin(centralProblems, eq(centralPlaylistProblems.problemId, centralProblems.id))
      .leftJoin(
        userCentralProblems,
        and(
          eq(userCentralProblems.centralProblemId, centralProblems.id),
          eq(userCentralProblems.userId, firebaseUser.uid)
        )
      )
      .where(eq(centralPlaylistProblems.playlistId, playlistId));

    const mappedResult = result.map((item) => ({
      ...item,
      completed: item.completed ?? false,
      notes: item.notes ?? "",
    }));

    return c.json(mappedResult);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
