import { Hono } from "hono";
import { firebaseAuthMiddleware } from "../middleware/auth";
import { syncUser } from "../controller/auth.controller";

const router = new Hono();
router.use("/sync", firebaseAuthMiddleware);
router.post("/sync", syncUser);

export default router;
