import { db, solvedHistory, questions, centralProblems, eq } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getSolvedHistory = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const history = await db
      .select({
        id: solvedHistory.id,
        problemType: solvedHistory.problemType,
        questionId: solvedHistory.questionId,
        centralProblemId: solvedHistory.centralProblemId,
        solvedAt: solvedHistory.solvedAt,
        userTitle: questions.title,
        userUrl: questions.leetcodeUrl,
        userDifficulty: questions.difficultyLevel,
        centralTitle: centralProblems.title,
        centralUrl: centralProblems.leetcodeUrl,
        centralDifficulty: centralProblems.difficultyLevel,
      })
      .from(solvedHistory)
      .leftJoin(questions, eq(solvedHistory.questionId, questions.id))
      .leftJoin(centralProblems, eq(solvedHistory.centralProblemId, centralProblems.id))
      .where(eq(solvedHistory.userId, firebaseUser.uid))
      .orderBy(solvedHistory.solvedAt);

    const result = history.map((h) => {
      const isCentral = h.problemType === "central";
      return {
        id: h.id,
        problemId: isCentral ? h.centralProblemId : h.questionId,
        type: h.problemType,
        title: isCentral ? h.centralTitle : h.userTitle,
        url: isCentral ? h.centralUrl : h.userUrl,
        difficulty: isCentral ? h.centralDifficulty : h.userDifficulty,
        solvedAt: h.solvedAt,
      };
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
