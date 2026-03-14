import { Router } from "express";
import authRouter from "./authRoutes.js";
import friendRouter from "./friendRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/friends", friendRouter);

export default apiRouter;
