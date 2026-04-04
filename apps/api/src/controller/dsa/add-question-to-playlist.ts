import { db, playlists, playlistQuestions, questions, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

type AddQuestionToPlaylistBody = {
  problemId?: unknown; // Still named 'problemId' for frontend compatibility
};

export const addQuestionToPlaylist = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const playlistId = Number(c.req.param("id"));

  if (!Number.isInteger(playlistId) || playlistId <= 0) {
    return c.json({ error: "Invalid playlist id" }, 400);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const body = (await c.req.json()) as AddQuestionToPlaylistBody;
    const questionId =
      typeof body.problemId === "number" ? body.problemId : Number(body.problemId);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return c.json({ error: "A valid questionId is required" }, 400);
    }

    // 1. Verify playlist exists and belongs to user
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, firebaseUser.uid)))
      .limit(1);

    if (!playlist) {
      return c.json({ error: "Playlist not found" }, 404);
    }

    // 2. Verify question exists and belongs to user
    const [question] = await db
      .select()
      .from(questions)
      .where(and(eq(questions.id, questionId), eq(questions.userId, firebaseUser.uid)))
      .limit(1);

    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }

    // 3. Check if already in playlist
    const [existingPlaylistQuestion] = await db
      .select()
      .from(playlistQuestions)
      .where(
        and(
          eq(playlistQuestions.playlistId, playlistId),
          eq(playlistQuestions.questionId, question.id),
        ),
      )
      .limit(1);

    if (existingPlaylistQuestion) {
      return c.json({
        playlistId,
        questionId: question.id,
        alreadyExists: true,
      });
    }

    // 4. Link question to playlist
    await db.insert(playlistQuestions).values({
      playlistId,
      questionId: question.id,
    });

    return c.json(
      {
        playlistId,
        questionId: question.id,
        alreadyExists: false,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
