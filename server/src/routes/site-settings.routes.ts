import { Router } from "express";
import { getNewArrivalsSetting, updateNewArrivalsSetting } from "../controllers/admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const siteSettingsRouter = Router();

siteSettingsRouter.get("/new-arrivals", asyncHandler(getNewArrivalsSetting));
siteSettingsRouter.patch("/new-arrivals", requireAuth, requireAdmin, asyncHandler(updateNewArrivalsSetting));

export default siteSettingsRouter;