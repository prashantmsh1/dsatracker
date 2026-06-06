import { db, centralProblems, userCentralProblems, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getCentralProblem = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const id = Number(c.req.param("id"));

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  if (isNaN(id)) {
    return c.json({ error: "Invalid central problem ID" }, 400);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const [problem] = await db
      .select({
        id: centralProblems.id,
        title: centralProblems.title,
        url: centralProblems.leetcodeUrl,
        difficulty: centralProblems.difficultyLevel,
        category: centralProblems.category,
        description: centralProblems.description,
        completed: userCentralProblems.completed,
        notes: userCentralProblems.notes,
        createdAt: centralProblems.createdAt,
        updatedAt: centralProblems.updatedAt,
      })
      .from(centralProblems)
      .leftJoin(
        userCentralProblems,
        and(
          eq(userCentralProblems.centralProblemId, centralProblems.id),
          eq(userCentralProblems.userId, firebaseUser.uid)
        )
      )
      .where(eq(centralProblems.id, id))
      .limit(1);

    if (!problem) {
      return c.json({ error: "Central Problem not found" }, 404);
    }

    return c.json({
      ...problem,
      completed: problem.completed ?? false,
      notes: problem.notes ?? "",
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
