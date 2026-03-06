import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { MonitorResult } from '../monitors/httpMonitor.js';

// Construct and send a structured payload to a Discord channel via Webhook
export const sendDiscordAlert = async (result: MonitorResult): Promise<void> => {
    try {
        const payload = {
            content: `CRITICAL: Uptime Alert for ${result.url}`,
            embeds: [
                {
                    title: 'Website Outage Detected',
                    description: `The monitoring service detected that the website is unreachable or returning an error.`,
                    color: 16711680, // Red color represented as a decimal value for Discord API
                    fields: [
                        {
                            name: 'Target URL',
                            value: result.url,
                            inline: false,
                        },
                        {
                            name: 'Error Details',
                            value: result.errorDetails || 'No additional details provided by the monitor',
                            inline: false,
                        },
                        {
                            name: 'Response Time',
                            value: `${result.responseTimeMs} ms`,
                            inline: true,
                        }
                    ],
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Execute the POST request to the configured Discord webhook endpoint
        await axios.post(config.DISCORD_WEBHOOK_URL, payload);
        logger.info(`Discord alert successfully dispatched for ${result.url}`);

    } catch (error) {
        // Log the failure to send the alert, but ensure this does not crash the main application process
        let errorMessage = 'Unknown error occurred during alert dispatch';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        logger.error('Failed to send Discord alert', { target: result.url, error: errorMessage });
    }
};