import { Router } from "express";

const apiRouter = Router();

apiRouter.use("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default apiRouter;
