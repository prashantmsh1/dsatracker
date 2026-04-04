import { db, questions, eq } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getProblems = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const userQuestions = await db
      .select({
        id: questions.id,
        title: questions.title,
        url: questions.leetcodeUrl, // Map to 'url' for frontend consistency
        difficulty: questions.difficultyLevel, // Map to 'difficulty' for frontend consistency
        category: questions.category,
        notes: questions.notes,
        completed: questions.completed,
      })
      .from(questions)
      .where(eq(questions.userId, firebaseUser.uid));

    return c.json(userQuestions);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
