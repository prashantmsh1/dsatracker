import type { MiddlewareHandler } from "hono";
import { auth } from "../lib/firebase-admin";
import type { AppBindings, VerifiedFirebaseUser } from "../types/auth";

function getBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export const firebaseAuthMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const token = getBearerToken(c.req.header("Authorization"));

  if (!token) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken.email) {
      return c.json({ error: "Verified Firebase user does not have an email address" }, 400);
    }

    const firebaseUser: VerifiedFirebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name ?? null,
      decodedToken,
    };

    c.set("firebaseUser", firebaseUser);
    await next();
  } catch (error) {
    return c.json({ error: (error as Error).message || "Invalid Firebase token" }, 401);
  }
};
