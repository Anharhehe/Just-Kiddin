import { Router } from "express";
import { createReview, getReviews } from "../controllers/review.controller";
import { optionalAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const reviewRouter = Router();

reviewRouter.get("/", asyncHandler(getReviews));
reviewRouter.post("/", optionalAuth, asyncHandler(createReview));

export default reviewRouter;