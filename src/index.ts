import "dotenv/config";
import {
  deleteSessionTokenCookie,
  invalidateSession,
  setSessionTokenCookie,
  validateSessionToken,
} from "@/lib/auth";
import { superjsonMiddleware } from "@/middleware/superjson";
import express from "express";
import morgan from "morgan";
import path from "path";

import { apiRouter } from "./api";

export const app = express();
const port = 3050;

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}

app.use((req, res, next) => {
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
});
app.use(express.urlencoded({ extended: true }));
app.use(superjsonMiddleware);

app.use((req, res, next) => {
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

  console.log(originHeader, hostHeader, process.env.NODE_ENV);

  if (!originHeader || !hostHeader || hostHeader != originHeader) {
    res.status(403).end();
  }
  return next();
});

app.use(async (req, res, next) => {
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
});

app.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

const server = app.listen(port);

try {
  const serverMetadata = server.address() as { address: string; port: number };
  console.log(
    `\n\nServer listening on http://${
      serverMetadata.address === "::" ? "127.0.0.1" : serverMetadata.address
    }:${serverMetadata.port}`,
  );
} catch (e) {
  console.error(e);
}
