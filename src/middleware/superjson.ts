import { s } from "@rider/packages/superjson";
import { NextFunction, Request, Response } from "express";

export const superjsonMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.is("application/json")) {
    let data = "";

    req.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });

    req.on("end", () => {
      try {
        req.body = s.parse(data);
        next();
      } catch {
        next(new Error("Invalid SuperJSON"));
      }
    });
  } else {
    next();
  }

  // Override the res.json method to serialize responses with SuperJSON, if it is possible.
  // const originalJson = res.json.bind(res);
  // res.json = (data: unknown): Response => {
  //   const serializedData = superjson.serialize(data);
  //   return originalJson(serializedData);
  // };
};
