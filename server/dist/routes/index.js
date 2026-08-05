"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const contact_query_routes_1 = __importDefault(require("./contact-query.routes"));
const favourites_routes_1 = __importDefault(require("./favourites.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const apiRouter = (0, express_1.Router)();
apiRouter.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Backend is healthy" });
});
apiRouter.use("/auth", auth_routes_1.default);
apiRouter.use("/contact-queries", contact_query_routes_1.default);
apiRouter.use("/favourites", favourites_routes_1.default);
apiRouter.use("/orders", order_routes_1.default);
exports.default = apiRouter;
