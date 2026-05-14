import pino from "pino";

// Create centralized logger instance
// Used across the app for structured logging
const logger = pino({
    level: "info",                         // minimum log level (info, warn, error)

    transport: {
        target: "pino-pretty",             // format logs for human-readable output (dev only)
        options: {
            colorize: true,                // adds colors for better readability in terminal
            singleLine: true,              // add logs in single line
        },
    },
});

export default logger;           
