import type { NextFunction, Request, Response } from "express";

/**
 * Custom implementation of a cookie parser.
 * It just simply takes all the cookies and stores them as a simple key-value store.
 */
export const cookieParser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    headers: { cookie },
  } = req;
  if (cookie) {
    const values = cookie.split(";").reduce((res, item) => {
      const [name, value] = item.trim().split("=");
      return { ...res, [name]: value };
    }, {});
    res.locals.cookie = values;
  } else res.locals.cookie = {};
  next();
};
