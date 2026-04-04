import { db, questions, eq, and, sql } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getDailyPlan = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  try {
    const user = await ensureUserRecord(firebaseUser);

    // 1. Fetch questions for the daily plan
    // Logic: Problems that have not been shown recently
    const dailyQuestions = await db
      .select({
        id: questions.id,
        title: questions.title,
        url: questions.leetcodeUrl,
        difficulty: questions.difficultyLevel,
        notes: questions.notes,
        lastShownAt: questions.lastShownAt,
      })
      .from(questions)
      .where(eq(questions.userId, firebaseUser.uid))
      .orderBy(sql`RANDOM()`) // Randomized for now for the static plan look
      .limit(3);

    // 2. If it's empty, we could suggest some from global problems or return empty
    const response = dailyQuestions.map((q) => ({
      ...q,
      type: q.difficulty === "Easy" ? "Solve" : q.difficulty === "Hard" ? "Review" : "Revise",
    }));

    return c.json(response);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
