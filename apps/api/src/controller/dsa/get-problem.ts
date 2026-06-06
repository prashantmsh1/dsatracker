import { db, questions, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getProblem = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const id = Number(c.req.param("id"));

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  if (isNaN(id)) {
    return c.json({ error: "Invalid problem ID" }, 400);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const [question] = await db
      .select({
        id: questions.id,
        title: questions.title,
        url: questions.leetcodeUrl,
        difficulty: questions.difficultyLevel,
        category: questions.category,
        notes: questions.notes,
        description: questions.description,
        completed: questions.completed,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
      })
      .from(questions)
      .where(and(eq(questions.id, id), eq(questions.userId, firebaseUser.uid)))
      .limit(1);

    if (!question) {
      return c.json({ error: "Problem not found or unauthorized" }, 404);
    }

    return c.json(question);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
