import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import path from "path";

import { apiRouter } from "./api";

dotenv.config();

export const app = express();
const port = 3050;

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}
app.use(cookieParser());

app.use(apiRouter);

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
