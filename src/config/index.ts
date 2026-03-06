import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define schema using z.coerce for safe type casting from string to number
const envSchema = z.object({
    DISCORD_WEBHOOK_URL: z.string().url(),
    CHECK_INTERVAL_MINUTES: z.coerce.number().min(1).default(5),
    REQUEST_TIMEOUT_MS: z.coerce.number().min(1000).default(5000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('CRITICAL ERROR: Invalid environment configuration.');
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const config = parsedEnv.data;