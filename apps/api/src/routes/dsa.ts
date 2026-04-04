import { Hono } from "hono";
import { firebaseAuthMiddleware } from "../middleware/auth";
import type { AppBindings } from "../types/auth";
import { getProblems } from "../controller/dsa/get-problems";
import { addProblem } from "../controller/dsa/add-problem";
import { getPlaylists } from "../controller/dsa/get-playlists";
import { createPlaylist } from "../controller/dsa/create-playlist";
import { addQuestionToPlaylist } from "../controller/dsa/add-question-to-playlist";
import { getPlaylistQuestions } from "../controller/dsa/get-playlist-questions";
import { getStats } from "../controller/dsa/get-stats";
import { getDailyPlan } from "../controller/dsa/get-daily-plan";

export const dsaRoutes = new Hono<AppBindings>();

// Problems routes
dsaRoutes.get("/problems", firebaseAuthMiddleware, getProblems);
dsaRoutes.post("/problems", firebaseAuthMiddleware, addProblem);

// Dashboard routes (Require Auth)
dsaRoutes.use("/dashboard/*", firebaseAuthMiddleware);
dsaRoutes.get("/dashboard/stats", getStats);
dsaRoutes.get("/dashboard/daily-plan", getDailyPlan);

// Playlists routes (Require Auth)
dsaRoutes.use("/playlists", firebaseAuthMiddleware);
dsaRoutes.use("/playlists/*", firebaseAuthMiddleware);

dsaRoutes.get("/playlists", getPlaylists);
dsaRoutes.post("/playlists", createPlaylist);
dsaRoutes.get("/playlists/:id/questions", getPlaylistQuestions);
dsaRoutes.post("/playlists/:id/questions", addQuestionToPlaylist);
