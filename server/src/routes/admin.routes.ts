import { Router } from "express";
import multer from "multer";
import { deleteAdminContactQuery, deleteAdminReview, createAdminReview, getAdminContactQueries, getAdminCustomerByEmail, getAdminCustomers, getAdminOrders, getAdminOverview, getAdminReviews, markAdminContactQueryAsRead, updateAdminOrderStatus, updateAdminReview } from "../controllers/admin.controller";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProducts,
  updateProduct,
  uploadProductImage,
  uploadProductImages,
} from "../controllers/product.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 10 } });

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/overview", asyncHandler(getAdminOverview));
adminRouter.get("/queries", asyncHandler(getAdminContactQueries));
adminRouter.get("/products", asyncHandler(getProducts));
adminRouter.post("/products", asyncHandler(createProduct));
adminRouter.patch("/products/:productId", asyncHandler(updateProduct));
adminRouter.delete("/products/:productId", asyncHandler(deleteProduct));
adminRouter.post("/products/:productId/images", asyncHandler(uploadProductImage));
adminRouter.post("/products/:productId/images/batch", upload.array("files", 10), asyncHandler(uploadProductImages));
adminRouter.delete("/products/:productId/images/:imageId", asyncHandler(deleteProductImage));
adminRouter.patch("/queries/:queryId/read", asyncHandler(markAdminContactQueryAsRead));
adminRouter.delete("/queries/:queryId", asyncHandler(deleteAdminContactQuery));
adminRouter.get("/orders", asyncHandler(getAdminOrders));
adminRouter.patch("/orders/:orderId/status", asyncHandler(updateAdminOrderStatus));
adminRouter.get("/customers", asyncHandler(getAdminCustomers));
adminRouter.get("/customers/:email", asyncHandler(getAdminCustomerByEmail));
adminRouter.get("/reviews", asyncHandler(getAdminReviews));
adminRouter.post("/reviews", asyncHandler(createAdminReview));
adminRouter.patch("/reviews/:reviewId", asyncHandler(updateAdminReview));
adminRouter.delete("/reviews/:reviewId", asyncHandler(deleteAdminReview));

export default adminRouter;
