"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_query_controller_1 = require("../controllers/contact-query.controller");
const async_handler_1 = require("../utils/async-handler");
const contactQueryRouter = (0, express_1.Router)();
contactQueryRouter.post("/", (0, async_handler_1.asyncHandler)(contact_query_controller_1.createContactQuery));
exports.default = contactQueryRouter;
