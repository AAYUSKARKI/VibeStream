// utils/logger.js
import winston from 'winston';

const { createLogger, format, transports } = winston;

const logger = createLogger({
    level: 'info', // Default log level
    format: format.combine(
        format.timestamp(), // Add timestamp to logs
        format.json() // Log in JSON format
    ),
    transports: [
        new transports.File({ filename: 'combined.log' }), // Log to file
        new transports.Console() // Log to console
    ],
});

export default logger;
