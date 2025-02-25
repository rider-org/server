import type { NextFunction, Request, Response } from "express";

const origins: string[] = [];

/**
 * CSRF Middleware that ensures that the token was not stolen.
 */
export const csrfProtector = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.method === "GET") {
    return next();
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV == "test"
  ) {
    return next();
  }
  const originHeader = req.headers.origin;
  const hostHeader = req.headers.host;

  if (!originHeader || !hostHeader || !origins.includes(originHeader)) {
    res.status(403).end();
  }
  return next();
};
