import { Router } from "express";
import {
  addFavourite,
  checkFavourite,
  getFavourites,
  removeFavourite,
} from "../controllers/favourites.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const favouritesRouter = Router();

favouritesRouter.get(  "/",              requireAuth, asyncHandler(getFavourites));
favouritesRouter.post( "/",              requireAuth, asyncHandler(addFavourite));
favouritesRouter.get(  "/:productId",    requireAuth, asyncHandler(checkFavourite));
favouritesRouter.delete("/:productId",   requireAuth, asyncHandler(removeFavourite));

export default favouritesRouter;
