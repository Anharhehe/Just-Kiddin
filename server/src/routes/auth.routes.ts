import { Router } from "express";
import {
  deleteCurrentUser,
  getCurrentUser,
  googleCallback,
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
  updateCurrentUser
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const authRouter = Router();

authRouter.post("/register", asyncHandler(registerWithEmail));
authRouter.post("/login", asyncHandler(loginWithEmail));
authRouter.get("/google", asyncHandler(loginWithGoogle));
authRouter.get("/google/callback", asyncHandler(googleCallback));
authRouter.get("/me", requireAuth, asyncHandler(getCurrentUser));
authRouter.patch("/me", requireAuth, asyncHandler(updateCurrentUser));
authRouter.delete("/me", requireAuth, asyncHandler(deleteCurrentUser));
authRouter.post("/logout", asyncHandler(logout));

export default authRouter;
