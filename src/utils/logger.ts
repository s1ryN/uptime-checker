// Define standard log levels for filtering and clarity
type LogLevel = 'INFO' | 'WARN' | 'ERROR';

// Core logging function that formats output with timestamps
const log = (level: LogLevel, message: string, meta?: any): void => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}]: ${message}`;

    // Output metadata to the console if it is provided
    if (meta) {
        console.log(formattedMessage, JSON.stringify(meta));
        return;
    }

    console.log(formattedMessage);
};

// Export a structured logger object to standardise logging calls
export const logger = {
    info: (message: string, meta?: any) => log('INFO', message, meta),
    warn: (message: string, meta?: any) => log('WARN', message, meta),
    error: (message: string, meta?: any) => log('ERROR', message, meta),
};