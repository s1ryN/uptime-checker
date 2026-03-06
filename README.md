# Uptime Checker Daemon

A robust, background-running Uptime Monitoring service built with Node.js and TypeScript. It periodically checks the health of configured URLs and dispatches real-time alerts via Discord Webhooks when state transitions occur (e.g., a service goes offline or recovers).

## Key Features

* **Smart Alerting (State Management):** Implements an in-memory state map to prevent alert fatigue. Notifications are strictly dispatched only upon state changes (UP -> DOWN or DOWN -> UP).
* **Robust Error Handling:** Safely catches network anomalies, DNS resolution failures (`EAI_AGAIN`), and HTTP timeouts without crashing the main Node.js process.
* **Type-Safe Environment:** Utilizes `Zod` for strict runtime environment variable validation, ensuring the application fails fast if misconfigured.
* **Modern Architecture:** Built entirely with ECMAScript Modules (ESM) in Node.js for future-proof module resolution.
* **Custom HTTPS Agent:** Configured to bypass local/internal SSL certificate issues, allowing it to reliably monitor internal infrastructure with self-signed certificates.

## Tech Stack

* **Runtime:** Node.js
* **Language:** TypeScript (Strict Mode, ESM via `NodeNext`)
* **HTTP Client:** `axios`
* **Task Scheduling:** `node-cron`
* **Validation:** `zod`
* **Execution:** `tsx`

## Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18 or newer) installed on your system.

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Configuration
Create a `.env` file in the root directory and configure your environment variables:
```env
# Required: Your Discord channel webhook URL
DISCORD_WEBHOOK_URL=[https://discord.com/api/webhooks/](https://discord.com/api/webhooks/)...

# Optional: How often to check the targets (defaults to 5)
CHECK_INTERVAL_MINUTES=1

# Optional: How long to wait before considering a request timed out (defaults to 5000)
REQUEST_TIMEOUT_MS=5000
```

### 4. Running the Daemon
To start the monitoring service in development mode:
```bash
npm start
```

## Architecture & Logic

The daemon operates on a simple but effective state machine loop:
1.  **Cron Scheduler:** Triggers the checking mechanism at the defined interval.
2.  **HTTP Monitor:** Pings the predefined URLs. Treats HTTP `200-299` as healthy and anything else (including timeouts and DNS errors) as an outage.
3.  **State Comparator:** Compares the current result against the `stateMap`. 
4.  **Notifier:** If a transition is detected, a formatted payload is dispatched to the Discord Webhook.

## License
This project is open-source and available under the MIT License.