import { Router } from "express";
import { createOrder, getMyOrders, getOrderById, validatePromoCode } from "../controllers/order.controller";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const orderRouter = Router();

orderRouter.post("/", optionalAuth, asyncHandler(createOrder));
orderRouter.get("/validate-promo", requireAuth, asyncHandler(validatePromoCode));
orderRouter.get("/track/:orderId", asyncHandler(getOrderById));
orderRouter.get("/me", requireAuth, asyncHandler(getMyOrders));

export default orderRouter;