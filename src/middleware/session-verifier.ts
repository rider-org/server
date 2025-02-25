import type { NextFunction, Request, Response } from "express";

import {
  validateSessionToken,
  invalidateSession,
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from "@/lib/auth";

/**
 * This code creates the locals object based on whether or not a cookie exists and is valid.
 * In short, in your actual route, you can configure how to protect the route
 * using `res.locals.session` & `res.locals.user`
 *
 * @example
 * ```ts
 * authRouterV1.get("/validate", (_, res) => {
 *   const { session, user } = res.locals;
 *
 *   if (!session || !user) {
 *     return sendSuperJson(res, 401, {
 *       success: false,
 *       message: "You are not authenticated.",
 *     });
 *   }
 *
 *   return sendSuperJson(res, 200, {
 *     success: true,
 *     message: "You are authenticated!",
 *     data: { user, session },
 *   });
 * });
 * ```
 */
export const sessionVerifier = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  const sessionId = res.locals.cookie["session_token"];

  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }

  const { session, user } = await validateSessionToken(sessionId);

  if (session == null) {
    await invalidateSession(sessionId);
    deleteSessionTokenCookie(res);
    res.locals.session = session;
    res.locals.user = user;
    return next();
  }

  setSessionTokenCookie(res, session.id, session.expiresAt);
  res.locals.session = session;
  res.locals.user = user;
  return next();
};
