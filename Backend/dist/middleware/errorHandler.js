"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error(`Error ${req.method} ${req.originalUrl}: ${err.message}`, {
        error: err.stack,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { ...error, message, status: 404 };
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { ...error, message, status: 400 };
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = { ...error, message, status: 400 };
    }
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        switch (prismaError.code) {
            case 'P2002':
                error = { ...error, message: 'Duplicate field value entered', status: 400 };
                break;
            case 'P2025':
                error = { ...error, message: 'Resource not found', status: 404 };
                break;
            default:
                error = { ...error, message: 'Database error', status: 500 };
        }
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { ...error, message, status: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { ...error, message, status: 401 };
    }
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            const message = 'File too large';
            error = { ...error, message, status: 400 };
        }
        else if (err.code === 'LIMIT_FILE_COUNT') {
            const message = 'Too many files';
            error = { ...error, message, status: 400 };
        }
        else {
            const message = 'File upload error';
            error = { ...error, message, status: 400 };
        }
    }
    res.status(error.status || error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map