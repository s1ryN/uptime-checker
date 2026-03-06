import cron from 'node-cron';
import { config } from './config/index.js';
import { checkWebsite } from './monitors/httpMonitor.js';
import { sendDiscordAlert } from './notifiers/discord.js';
import { logger } from './utils/logger.js';

// Define the static list of target URLs to monitor
const targets: string[] = [
    'https://example.com',
    'https://httpstat.us/503', // Intentional failure for testing purposes
];

// Memory structure to track the previous state of each URL to prevent duplicate alerts
// Key represents the URL, Value represents the boolean 'isUp' status from the last check
const stateMap = new Map<string, boolean>();

// Initialize the state map assuming all targets are operational at startup
targets.forEach(target => stateMap.set(target, true));

// Core logic executed periodically by the cron scheduler
const runMonitorTask = async (): Promise<void> => {
    logger.info('Executing scheduled uptime checks...');

    for (const url of targets) {
        const result = await checkWebsite(url);
        const wasUpPreviously = stateMap.get(url);

        if (!result.isUp && wasUpPreviously) {
            // State transitioned from UP to DOWN: Send alert and update memory state
            logger.warn(`State transition detected: ${url} went DOWN. Triggering alert.`);
            await sendDiscordAlert(result);
            stateMap.set(url, false);
            
        } else if (result.isUp && !wasUpPreviously) {
            // State transitioned from DOWN to UP: Update memory state to enable future alerts
            logger.info(`State transition detected: ${url} RECOVERED. Service restored.`);
            stateMap.set(url, true);
        }
    }

    logger.info('Scheduled uptime checks completed successfully.');
};

// Construct the cron expression using the interval from environment variables
const cronExpression = `*/${config.CHECK_INTERVAL_MINUTES} * * * *`;
logger.info(`Initializing Uptime Checker daemon. Cron schedule: ${cronExpression}`);

// Register the task with the cron scheduler
cron.schedule(cronExpression, runMonitorTask);

// Trigger an immediate execution on startup to provide instant feedback without waiting for the first cron tick
runMonitorTask();