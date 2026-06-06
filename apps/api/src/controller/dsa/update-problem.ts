import { db, questions, solvedHistory, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

type UpdateProblemBody = {
  title?: unknown;
  url?: unknown;
  difficulty?: unknown;
  category?: unknown;
  notes?: unknown;
  description?: unknown;
  completed?: unknown;
};

export const updateProblem = async (c: Context<AppBindings>) => {
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

    const body = (await c.req.json()) as UpdateProblemBody;
    const updateData: any = {};

    if (typeof body.title === "string") {
      updateData.title = body.title.trim();
    }
    if (typeof body.url === "string") {
      updateData.leetcodeUrl = body.url.trim();
    }
    if (typeof body.difficulty === "string") {
      updateData.difficultyLevel = body.difficulty.trim();
    }
    if (typeof body.category === "string") {
      updateData.category = body.category.trim();
    }
    if (typeof body.notes === "string") {
      updateData.notes = body.notes;
    }
    if (typeof body.description === "string") {
      updateData.description = body.description;
    }
    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
    }

    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 1) { // Only contains updatedAt
      return c.json({ error: "No update data provided" }, 400);
    }

    // Fetch current problem state to see if completed is changing
    const [currentProblem] = await db
      .select({ completed: questions.completed })
      .from(questions)
      .where(and(eq(questions.id, id), eq(questions.userId, firebaseUser.uid)))
      .limit(1);

    if (!currentProblem) {
      return c.json({ error: "Problem not found or unauthorized" }, 404);
    }

    const [updatedQuestion] = await db
      .update(questions)
      .set(updateData)
      .where(and(eq(questions.id, id), eq(questions.userId, firebaseUser.uid)))
      .returning();

    if (typeof body.completed === "boolean" && body.completed && !currentProblem.completed) {
      await db.insert(solvedHistory).values({
        userId: firebaseUser.uid,
        problemType: "user",
        questionId: id,
        solvedAt: new Date(),
      });
    }

    // Map fields back for client consistency
    const response = {
      id: updatedQuestion.id,
      title: updatedQuestion.title,
      url: updatedQuestion.leetcodeUrl,
      difficulty: updatedQuestion.difficultyLevel,
      category: updatedQuestion.category,
      notes: updatedQuestion.notes,
      description: updatedQuestion.description,
      completed: updatedQuestion.completed,
      createdAt: updatedQuestion.createdAt,
      updatedAt: updatedQuestion.updatedAt,
    };

    return c.json(response);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
