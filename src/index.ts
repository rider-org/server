import { apiRouter } from "@/api";
import { cookieParser } from "@/middleware/cookie-parser";
import { csrfProtector } from "@/middleware/csrf-protector";
import { sessionVerifier } from "@/middleware/session-verifier";
import { superjsonMiddleware } from "@/middleware/superjson";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import path from "path";

export const app = express();
const port = 3050;

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}

app.use(cookieParser);
app.use(express.urlencoded({ extended: true }));
app.use(superjsonMiddleware);
app.use(csrfProtector);
app.use(sessionVerifier);

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
