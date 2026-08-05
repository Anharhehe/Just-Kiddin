import { Router } from "express";
import { createContactQuery } from "../controllers/contact-query.controller";
import { asyncHandler } from "../utils/async-handler";

const contactQueryRouter = Router();

contactQueryRouter.post("/", asyncHandler(createContactQuery));

export default contactQueryRouter;
