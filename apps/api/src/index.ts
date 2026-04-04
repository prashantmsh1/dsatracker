import { Hono } from "hono";
import { cors } from "hono/cors";
import { dsaRoutes } from "./routes/dsa";
import { authRoutes } from "./routes/auth";
import type { AppBindings } from "./types/auth";

const app = new Hono<AppBindings>();

app.use(
    "*",
    cors({
        origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "OPTIONS"],
    }),
);

app.route("/auth", authRoutes);
app.route("/", dsaRoutes);

app.get("/", (c) => {
    return c.text("DSA Tracker API");
});

export default {
    port: 3001,
    fetch: app.fetch,
};
