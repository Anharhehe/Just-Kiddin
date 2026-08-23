import { Router } from "express";
import { getProductById, getProducts } from "../controllers/product.controller";
import { asyncHandler } from "../utils/async-handler";

const productRouter = Router();

productRouter.get("/", asyncHandler(getProducts));
productRouter.get("/:productId", asyncHandler(getProductById));

export default productRouter;
