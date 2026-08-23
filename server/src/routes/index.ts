import { Router } from "express";
import adminRouter from "./admin.routes";
import authRouter from "./auth.routes";
import contactQueryRouter from "./contact-query.routes";
import favouritesRouter from "./favourites.routes";
import orderRouter from "./order.routes";
import productRouter from "./product.routes";
import reviewRouter from "./review.routes";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy" });
});

apiRouter.use("/auth",       authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/contact-queries", contactQueryRouter);
apiRouter.use("/favourites", favouritesRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/reviews", reviewRouter);

export default apiRouter;
