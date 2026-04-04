import { db, questions, eq } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const addProblem = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const body = await c.req.json();

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const [newQuestion] = await db
      .insert(questions)
      .values({
        userId: firebaseUser.uid,
        leetcodeUrl: body.url,
        title: body.title,
        difficultyLevel: body.difficulty,
        category: body.category || "General",
        notes: body.notes || "",
        completed: false,
      })
      .returning();

    // Map fields for frontend consistency
    const response = {
        ids: newQuestion.id, // For some reason original code or frontend might expect id?
        title: newQuestion.title,
        url: newQuestion.leetcodeUrl,
        difficulty: newQuestion.difficultyLevel,
        category: newQuestion.category,
        notes: newQuestion.notes,
        completed: newQuestion.completed,
    };

    return c.json(newQuestion, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
