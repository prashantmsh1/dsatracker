import { db, users, eq, userSettings } from "@repo/db";
import { Hono } from "hono";
import { firebaseAuthMiddleware } from "../middleware/auth";
import type { AppBindings } from "../types/auth";

export const authRoutes = new Hono<AppBindings>();

authRoutes.post("/sync", firebaseAuthMiddleware, async (c) => {
  try {
    const firebaseUser = c.get("firebaseUser");
    const [existingUser] = await db.select().from(users).where(eq(users.id, firebaseUser.uid)).limit(1);

    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({
          email: firebaseUser.email,
          displayName: firebaseUser.name,
        })
        .where(eq(users.id, firebaseUser.uid))
        .returning();

      // Ensure user settings record exists (backfill for existing users)
      await db
        .insert(userSettings)
        .values({ userId: firebaseUser.uid })
        .onConflictDoNothing();

      return c.json({ user: updatedUser, isNewUser: false });
    }

    const [newUser] = await db
      .insert(users)
      .values({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.name,
      })
      .returning();

    // Create default settings for new user
    await db.insert(userSettings).values({
      userId: firebaseUser.uid,
    });

    return c.json({ user: newUser, isNewUser: true }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

authRoutes.get("/settings", firebaseAuthMiddleware, async (c) => {
  try {
    const firebaseUser = c.get("firebaseUser");

    // Fetch user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, firebaseUser.uid))
      .limit(1);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Fetch user settings (or insert if they don't exist yet, for safety)
    let [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, firebaseUser.uid))
      .limit(1);

    if (!settings) {
      [settings] = await db
        .insert(userSettings)
        .values({ userId: firebaseUser.uid })
        .returning();
    }

    return c.json({
      email: user.email,
      displayName: user.displayName,
      theme: settings.theme,
      preferredDifficulty: settings.preferredDifficulty,
      dailyTarget: settings.dailyTarget,
      weeklyGoal: settings.weeklyGoal,
      cooldownDays: settings.cooldownDays,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

authRoutes.patch("/settings", firebaseAuthMiddleware, async (c) => {
  try {
    const firebaseUser = c.get("firebaseUser");
    const body = await c.req.json();

    const { displayName, theme, preferredDifficulty, dailyTarget, weeklyGoal, cooldownDays } = body;

    // Start transaction to update both if required
    await db.transaction(async (tx) => {
      // 1. Update users table if displayName is provided
      if (displayName !== undefined) {
        await tx
          .update(users)
          .set({ displayName })
          .where(eq(users.id, firebaseUser.uid));
      }

      // 2. Update user_settings table
      const settingsUpdates: Partial<typeof userSettings.$inferInsert> = {};
      if (theme !== undefined) settingsUpdates.theme = theme;
      if (preferredDifficulty !== undefined) settingsUpdates.preferredDifficulty = preferredDifficulty;
      if (dailyTarget !== undefined) settingsUpdates.dailyTarget = dailyTarget;
      if (weeklyGoal !== undefined) settingsUpdates.weeklyGoal = weeklyGoal;
      if (cooldownDays !== undefined) {
        settingsUpdates.cooldownDays = cooldownDays;
        // Update users.cooldownDays as well for backwards compatibility!
        await tx
          .update(users)
          .set({ cooldownDays })
          .where(eq(users.id, firebaseUser.uid));
      }

      if (Object.keys(settingsUpdates).length > 0) {
        await tx
          .update(userSettings)
          .set({ ...settingsUpdates, updatedAt: new Date() })
          .where(eq(userSettings.userId, firebaseUser.uid));
      }
    });

    // Fetch and return the updated user settings
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, firebaseUser.uid))
      .limit(1);

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, firebaseUser.uid))
      .limit(1);

    return c.json({
      email: user?.email,
      displayName: user?.displayName,
      theme: settings?.theme,
      preferredDifficulty: settings?.preferredDifficulty,
      dailyTarget: settings?.dailyTarget,
      weeklyGoal: settings?.weeklyGoal,
      cooldownDays: settings?.cooldownDays,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

