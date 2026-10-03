const errorMiddleware = (err, req, res, next) => {
    // Expected client errors are returned to the UI without terminal stack traces.
    if ((err.statusCode || 500) >= 500) {
        console.error(`[${req.method} ${req.path}] ${err.message || "Internal Server Error"}`);
    }
    if (res.headersSent) return next(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default errorMiddleware;