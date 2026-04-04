import { db, users } from "@repo/db";
import type { AppBindings } from "../types/auth";

export async function ensureUserRecord(
  user: AppBindings["Variables"]["firebaseUser"],
) {
  await db
    .insert(users)
    .values({
      id: user.uid,
      email: user.email,
      displayName: user.name,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: user.email,
        displayName: user.name,
      },
    });
}
