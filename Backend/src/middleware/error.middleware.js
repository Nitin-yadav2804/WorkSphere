const errorMiddleware = (err, req, res, next) => {
    // Normalize validation failures before deciding whether to log server errors.
    if (err.code === 11000) {
        err.statusCode = 409;
        err.message = 'A record with these details already exists';
    } else if (err.name === 'CastError') {
        err.statusCode = 400;
        err.message = 'Invalid resource ID or field value';
    } else if (err.name === 'ZodError' || err.name === 'ValidationError') {
        err.statusCode = 400;
        err.message = 'Validation failed';
    } else if (err.name === 'MulterError') {
        err.statusCode = 400;
        err.message = err.code === 'LIMIT_FILE_SIZE' ? 'File must be 10 MB or smaller' : 'Invalid file upload';
    }
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