import { Router } from "express";
import authRouter from "./auth.routes";
import contactQueryRouter from "./contact-query.routes";
import favouritesRouter from "./favourites.routes";
import orderRouter from "./order.routes";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy" });
});

apiRouter.use("/auth",       authRouter);
apiRouter.use("/contact-queries", contactQueryRouter);
apiRouter.use("/favourites", favouritesRouter);
apiRouter.use("/orders", orderRouter);

export default apiRouter;
