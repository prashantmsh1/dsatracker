import { db, playlists, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

type CreatePlaylistBody = {
  name?: unknown;
};

export const createPlaylist = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");

  try {
    await ensureUserRecord(firebaseUser);

    const body = (await c.req.json()) as CreatePlaylistBody;
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return c.json({ error: "Playlist name is required" }, 400);
    }

    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.userId, firebaseUser.uid), eq(playlists.name, name)))
      .limit(1);

    if (existingPlaylist) {
      return c.json({ error: "A playlist with this name already exists" }, 409);
    }

    const [playlist] = await db
      .insert(playlists)
      .values({
        userId: firebaseUser.uid,
        name,
      })
      .returning();

    return c.json(
      {
        ...playlist,
        problemCount: 0,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
