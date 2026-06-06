import { db, centralProblems, userCentralProblems, dailyRecommendations, eq, and, sql, inArray } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

export const getDailyPlan = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  if (!firebaseUser) {
    return c.json({ error: "Unauthorized: No user found in context" }, 401);
  }

  try {
    await ensureUserRecord(firebaseUser);

    // Get today's date in format YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0]!;

    // 1. Check if recommendations already exist for today
    const todayRecommendations = await db
      .select({
        centralProblemId: dailyRecommendations.centralProblemId,
      })
      .from(dailyRecommendations)
      .where(eq(dailyRecommendations.date, todayStr));

    if (todayRecommendations.length < 3) {
      // 2. We need to generate / backfill today's recommendations.
      const totalCountRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(centralProblems);

      const totalCount = Number(totalCountRes[0]?.count ?? 0);

      if (totalCount > 0) {
        // Find the most recent recommendation date for each central problem
        const problemsWithLastRec = await db
          .select({
            id: centralProblems.id,
            lastRecDate: sql<string | null>`max(${dailyRecommendations.date})`,
          })
          .from(centralProblems)
          .leftJoin(
            dailyRecommendations,
            eq(dailyRecommendations.centralProblemId, centralProblems.id)
          )
          .groupBy(centralProblems.id);

        // Sort: never recommended (null) first, then oldest recommended first
        problemsWithLastRec.sort((a, b) => {
          if (a.lastRecDate === null && b.lastRecDate !== null) return -1;
          if (a.lastRecDate !== null && b.lastRecDate === null) return 1;
          if (a.lastRecDate === null && b.lastRecDate === null) return 0;
          return a.lastRecDate!.localeCompare(b.lastRecDate!);
        });

        // Determine how many we need (up to 3)
        const needed = 3 - todayRecommendations.length;
        const alreadyRecommendedIds = new Set(todayRecommendations.map(r => r.centralProblemId));
        
        // Filter out already selected for today
        const candidates = problemsWithLastRec.filter(p => !alreadyRecommendedIds.has(p.id));
        const selected = candidates.slice(0, needed);

        // Insert the selected ones for today
        for (const problem of selected) {
          try {
            await db.insert(dailyRecommendations).values({
              date: todayStr,
              centralProblemId: problem.id,
            });
          } catch (e) {
            // Safe to ignore unique index/constraint errors from concurrent inserts
          }
        }
      }
    }

    // 3. Query the final set of recommendations for today
    const finalRecs = await db
      .select({
        centralProblemId: dailyRecommendations.centralProblemId,
      })
      .from(dailyRecommendations)
      .where(eq(dailyRecommendations.date, todayStr))
      .limit(3);

    const recIds = finalRecs.map((r) => r.centralProblemId);

    if (recIds.length === 0) {
      return c.json([]);
    }

    // 4. Fetch the details of today's recommended problems, left-joining user progress
    const dailyQuestions = await db
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
      )
      .where(inArray(centralProblems.id, recIds));

    // Map fields for client consistency and daily plan UI
    const response = dailyQuestions.map((q) => ({
      id: q.id,
      title: q.title,
      url: q.url,
      difficulty: q.difficulty,
      notes: q.notes ?? "",
      completed: q.completed ?? false,
      type: q.difficulty === "Easy" ? "Solve" : q.difficulty === "Hard" ? "Review" : "Revise",
    }));

    return c.json(response);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
