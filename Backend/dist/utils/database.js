"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});
exports.prisma = prisma;
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logger_1.logger.info(`Query: ${e.query}`);
        logger_1.logger.info(`Duration: ${e.duration}ms`);
    });
}
prisma.$on('error', (e) => {
    logger_1.logger.error('Database error:', e);
});
prisma.$on('warn', (e) => {
    logger_1.logger.warn('Database warning:', e);
});
//# sourceMappingURL=database.js.map