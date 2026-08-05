import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const orderRouter = Router();

orderRouter.post("/", asyncHandler(createOrder));
orderRouter.get("/track/:orderId", asyncHandler(getOrderById));
orderRouter.get("/me", requireAuth, asyncHandler(getMyOrders));

export default orderRouter;