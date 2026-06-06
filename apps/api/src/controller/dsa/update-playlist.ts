import { db, playlists, eq, and } from "@repo/db";
import type { Context } from "hono";
import type { AppBindings } from "../../types/auth";
import { ensureUserRecord } from "../../utils/user";

type UpdatePlaylistBody = {
  name?: unknown;
  theory?: unknown;
};

export const updatePlaylist = async (c: Context<AppBindings>) => {
  const firebaseUser = c.get("firebaseUser");
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid playlist ID" }, 400);
  }

  try {
    await ensureUserRecord(firebaseUser);

    const body = (await c.req.json()) as UpdatePlaylistBody;
    
    const updateData: Partial<{ name: string; theory: string }> = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name) updateData.name = name;
    }

    if (typeof body.theory === "string") {
      updateData.theory = body.theory;
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: "No update data provided" }, 400);
    }

    const [playlist] = await db
      .update(playlists)
      .set(updateData)
      .where(and(eq(playlists.id, id), eq(playlists.userId, firebaseUser.uid)))
      .returning();

    if (!playlist) {
      return c.json({ error: "Playlist not found or unauthorized" }, 404);
    }

    return c.json(playlist);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
