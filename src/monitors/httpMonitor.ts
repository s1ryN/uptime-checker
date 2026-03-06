import axios, { AxiosError } from 'axios';
import https from 'https';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export interface MonitorResult {
    url: string;
    isUp: boolean;
    responseTimeMs?: number;
    errorDetails?: string;
}

// Create a custom HTTPS agent configured to ignore SSL certificate validation errors.
// This is critical for uptime checkers that need to monitor internal infrastructure
// with self-signed certificates or bypass local development proxy/antivirus interceptions.
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// Perform an HTTP GET request to check the health of a target URL
export const checkWebsite = async (url: string): Promise<MonitorResult> => {
    const startTime = performance.now();

    try {
        // Execute request with strict timeout, custom HTTPS agent, and custom status validation
        const response = await axios.get(url, {
            timeout: config.REQUEST_TIMEOUT_MS,
            validateStatus: () => true,
            httpsAgent
        });

        const endTime = performance.now();
        const responseTimeMs = Math.round(endTime - startTime);

        // Treat HTTP 200-299 as healthy, everything else as an outage
        const isUp = response.status >= 200 && response.status < 300;

        if (!isUp) {
            logger.warn(`Website ${url} returned non-success status code.`, { statusCode: response.status });
        } else {
            logger.info(`Website ${url} is up.`, { responseTimeMs });
        }

        return {
            url,
            isUp,
            responseTimeMs,
            errorDetails: isUp ? undefined : `HTTP Status: ${response.status}`
        };

    } catch (error) {
        const endTime = performance.now();
        const responseTimeMs = Math.round(endTime - startTime);
        let errorDetails = 'Unknown network error occurred';

        // Differentiate between timeout issues and general network failures
        if (error instanceof AxiosError) {
            errorDetails = error.code === 'ECONNABORTED' 
                ? 'Request timed out' 
                : error.message;
        } else if (error instanceof Error) {
            errorDetails = error.message;
        }

        logger.error(`Website ${url} check failed.`, { errorDetails });

        return {
            url,
            isUp: false,
            responseTimeMs,
            errorDetails
        };
    }
};