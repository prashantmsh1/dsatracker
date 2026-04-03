import { Hono } from "hono";
import { cors } from "hono/cors";
import { db, problems } from "@repo/db";
import { authRoutes } from "./routes/auth";
import type { AppBindings } from "./types/auth";

const app = new Hono<AppBindings>();

app.use(
    "*",
    cors({
        origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "OPTIONS"],
    })
);

app.route("/auth", authRoutes);

app.get("/", (c) => {
    return c.text("DSA Tracker API");
});

app.get("/problems", async (c) => {
    try {
        const allProblems = await db.select().from(problems);
        return c.json(allProblems);
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
});

app.post("/problems", async (c) => {
    try {
        const { title, url, difficulty, category } = await c.req.json();
        const newProblem = await db
            .insert(problems)
            .values({
                title,
                url,
                difficulty,
                category,
            })
            .returning();
        return c.json(newProblem[0]);
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
});

export default {
    port: 3001,
    fetch: app.fetch,
};
