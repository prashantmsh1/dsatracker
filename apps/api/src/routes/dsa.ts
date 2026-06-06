import { Hono } from "hono";
import { firebaseAuthMiddleware } from "../middleware/auth";
import type { AppBindings } from "../types/auth";
import { getProblems } from "../controller/dsa/get-problems";
import { addProblem } from "../controller/dsa/add-problem";
import { getProblem } from "../controller/dsa/get-problem";
import { updateProblem } from "../controller/dsa/update-problem";
import { getPlaylists } from "../controller/dsa/get-playlists";
import { createPlaylist } from "../controller/dsa/create-playlist";
import { addQuestionToPlaylist } from "../controller/dsa/add-question-to-playlist";
import { getPlaylistQuestions } from "../controller/dsa/get-playlist-questions";
import { getStats } from "../controller/dsa/get-stats";
import { getDailyPlan } from "../controller/dsa/get-daily-plan";
import { updatePlaylist } from "../controller/dsa/update-playlist";

// Central controllers
import { getCentralProblems } from "../controller/dsa/get-central-problems";
import { getCentralProblem } from "../controller/dsa/get-central-problem";
import { updateCentralProblem } from "../controller/dsa/update-central-problem";
import { getCentralPlaylists } from "../controller/dsa/get-central-playlists";
import { getCentralPlaylistQuestions } from "../controller/dsa/get-central-playlist-questions";
import { getSolvedHistory } from "../controller/dsa/get-solved-history";

export const dsaRoutes = new Hono<AppBindings>();

// Problems routes
dsaRoutes.get("/problems", firebaseAuthMiddleware, getProblems);
dsaRoutes.post("/problems", firebaseAuthMiddleware, addProblem);
dsaRoutes.get("/problems/:id", firebaseAuthMiddleware, getProblem);
dsaRoutes.patch("/problems/:id", firebaseAuthMiddleware, updateProblem);

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
dsaRoutes.patch("/playlists/:id", updatePlaylist);

// Centralized resources routes
dsaRoutes.get("/central/problems", firebaseAuthMiddleware, getCentralProblems);
dsaRoutes.get("/central/problems/:id", firebaseAuthMiddleware, getCentralProblem);
dsaRoutes.patch("/central/problems/:id", firebaseAuthMiddleware, updateCentralProblem);
dsaRoutes.get("/central/playlists", firebaseAuthMiddleware, getCentralPlaylists);
dsaRoutes.get("/central/playlists/:id/questions", firebaseAuthMiddleware, getCentralPlaylistQuestions);

// Solved history routes
dsaRoutes.get("/solved-history", firebaseAuthMiddleware, getSolvedHistory);

