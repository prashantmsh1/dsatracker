import { Context } from "hono";
import type { AppBindings } from "../types/auth";
import { db, eq, users, } from "@repo/db";

export const syncUser = async (c: Context<AppBindings>) => {
    const firebaseUser = c.get("firebaseUser");

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, firebaseUser.uid))
        .limit(1);

    if (existingUser.length > 0) {
        return c.json({ message: "User already exists" }, 200);
    }

    await db.insert(users).values({
        id: firebaseUser.uid,
        email: firebaseUser.email,
   
        displayName: firebaseUser.name,
    }).onConflictDoUpdate({
        target: users.id,
        set: {
            displayName: firebaseUser.name,
            email: firebaseUser.email,
        }
    });

    return c.json({ message: "User created successfully" }, 200);
};
