"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(req, res, _next) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
}
function errorHandler(err, _req, res, _next) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({
        success: false,
        message
    });
}
