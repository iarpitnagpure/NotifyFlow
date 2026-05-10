// BullMQ Queue (Producer)
// This queue is used by the API Gateway to enqueue notification jobs.
// Jobs pushed here will be processed asynchronously by the notification worker.
// Helps decouple request handling from background processing (non-blocking API).

// Connection:
// Queue and Worker are connected via Redis.
// As long as both use the same Redis instance and queue name ("notifications"),
// the worker will automatically pick up jobs from this queue.

import { Queue } from "bullmq";

const NOTIFICATION_WORKER_HOST = process.env.NOTIFICATION_WORKER_HOST;
const NOTIFICATION_WORKER_PORT = process.env.NOTIFICATION_WORKER_PORT;

const notificationQueue = new Queue("notifications", {
    connection: {
        host: NOTIFICATION_WORKER_HOST,
        port: NOTIFICATION_WORKER_PORT,
    },
});

export default notificationQueue;