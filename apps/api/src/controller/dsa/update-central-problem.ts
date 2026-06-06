import { db, userCentralProblems, solvedHistory, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

type UpdateCentralProblemBody = {
  completed?: unknown;
  notes?: unknown;
};

export const updateCentralProblem = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const centralProblemId = Number(c.req.param("id"));

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  if (isNaN(centralProblemId)) {
    return c.json({ error: "Invalid central problem ID" }, 400);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const body = (await c.req.json()) as UpdateCentralProblemBody;
    
    // Check if progress already exists
    const [existingProgress] = await db
      .select()
      .from(userCentralProblems)
      .where(
        and(
          eq(userCentralProblems.userId, firebaseUser.uid),
          eq(userCentralProblems.centralProblemId, centralProblemId)
        )
      )
      .limit(1);

    const notes = typeof body.notes === "string" ? body.notes : (existingProgress?.notes ?? "");
    const completed = typeof body.completed === "boolean" ? body.completed : (existingProgress?.completed ?? false);

    let updatedProgress;

    if (existingProgress) {
      // Update
      const [updated] = await db
        .update(userCentralProblems)
        .set({
          completed,
          notes,
          lastShownAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userCentralProblems.id, existingProgress.id))
        .returning();
      updatedProgress = updated;
    } else {
      // Insert (Upsert)
      const [inserted] = await db
        .insert(userCentralProblems)
        .values({
          userId: firebaseUser.uid,
          centralProblemId,
          completed,
          notes,
          lastShownAt: new Date(),
        })
        .returning();
      updatedProgress = inserted;
    }

    // Solved history logging:
    // If the problem is now completed and it wasn't previously completed, log to solvedHistory
    const wasAlreadyCompleted = existingProgress ? existingProgress.completed : false;
    if (completed && !wasAlreadyCompleted) {
      await db.insert(solvedHistory).values({
        userId: firebaseUser.uid,
        problemType: "central",
        centralProblemId,
        solvedAt: new Date(),
      });
    }

    return c.json({
      centralProblemId: updatedProgress.centralProblemId,
      completed: updatedProgress.completed,
      notes: updatedProgress.notes,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
