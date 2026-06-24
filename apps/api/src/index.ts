import { Hono } from "hono";
import { cors } from "hono/cors";
import { dsaRoutes } from "./routes/dsa";
import { authRoutes } from "./routes/auth";
import type { AppBindings } from "./types/auth";

const app = new Hono<AppBindings>();

const ALLOWED_ORIGIN_PATTERNS = [
    /^https:\/\/dsatracker\.prashantai\.com$/,
    /^https:\/\/dsatracker-web-.*\.vercel\.app$/,
    /^https:\/\/dsatracker-web\.vercel\.app$/,
    /^http:\/\/localhost(:\d+)?$/,
];

app.use(
    "*",
    cors({
        origin: (origin) => {
            // Check custom process.env.CORS_ORIGIN first (supports comma-separated values)
            if (process.env.CORS_ORIGIN) {
                const origins = process.env.CORS_ORIGIN.split(",").map((o) => o.trim());
                if (origins.includes(origin)) return origin;
            }
            // Check predefined regex patterns
            const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
            return isAllowed ? origin : "https://dsatracker.prashantai.com";
        },
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    }),
);

app.route("/auth", authRoutes);
app.route("/", dsaRoutes);

app.get("/health", (c) => {
    return c.text("DSA Tracker API");
});

export default {
    port: 3001,
    fetch: app.fetch,
};
