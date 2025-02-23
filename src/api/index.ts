import { authRouter } from "@/api/auth";
import { Router } from "express";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
