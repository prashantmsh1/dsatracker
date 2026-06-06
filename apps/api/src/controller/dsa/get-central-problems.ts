import { db, centralProblems, userCentralProblems, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getCentralProblems = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const problems = await db
      .select({
        id: centralProblems.id,
        title: centralProblems.title,
        url: centralProblems.leetcodeUrl,
        difficulty: centralProblems.difficultyLevel,
        category: centralProblems.category,
        completed: userCentralProblems.completed,
        notes: userCentralProblems.notes,
      })
      .from(centralProblems)
      .leftJoin(
        userCentralProblems,
        and(
          eq(userCentralProblems.centralProblemId, centralProblems.id),
          eq(userCentralProblems.userId, firebaseUser.uid)
        )
      );

    const result = problems.map(p => ({
      ...p,
      completed: p.completed ?? false,
      notes: p.notes ?? "",
    }));

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
