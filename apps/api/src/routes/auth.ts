import { db, users } from "@repo/db";
import { eq } from "drizzle-orm";
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

    return c.json({ user: newUser, isNewUser: true }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});
