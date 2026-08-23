import { Router } from "express";
import { createReview, getReviews } from "../controllers/review.controller";
import { asyncHandler } from "../utils/async-handler";

const reviewRouter = Router();

reviewRouter.get("/", asyncHandler(getReviews));
reviewRouter.post("/", asyncHandler(createReview));

export default reviewRouter;