// BullMQ Worker (Consumer)
// This worker listens to the "notifications" queue and processes jobs asynchronously.
// It pulls jobs from Redis (shared with the API Gateway queue) and executes them.
// Acts as an orchestrator: calls Notification Service via gRPC and handles retries on failure.
//
// Flow:
// Queue (API Gateway) → Redis → Notification Worker → gRPC → Notification Service

import 'dotenv/config';
import { Worker } from "bullmq";
import grpc from "@grpc/grpc-js";
import grpcClient from "./services/grpcClient.js";

const NOTIFICATION_WORKER_HOST = process.env.NOTIFICATION_WORKER_HOST;
const NOTIFICATION_WORKER_PORT = process.env.NOTIFICATION_WORKER_PORT;

const worker = new Worker(
    "notifications", // must match queue name (producer)
    async (job) => {
        // 1. Extract job payload
        const { userId, type, message } = job.data;

        // 2. Set gRPC deadline (timeout)
        // Prevents worker from waiting indefinitely on slow service
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 2);

        return new Promise((resolve, reject) => {
            // 3. Call Notification Service via gRPC
            grpcClient.SendNotification(
                { userId, type, message },                                    // job payload from queue

                { deadline },                                                 // enforce timeout at worker level

                (err, response) => {
                    // 4. Handle gRPC errors
                    if (err) {

                        // Timeout → service is slow (no response within deadline)
                        if (err.code === grpc.status.DEADLINE_EXCEEDED) {
                            console.error("Worker Timeout:", err.message);

                            // Reject → BullMQ marks job as failed and retries
                            return reject(err);
                        }

                        // Service unavailable → service down / unreachable
                        if (err.code === grpc.status.UNAVAILABLE) {
                            console.error("Service Down:", err.message);

                            // Reject → retry later
                            return reject(err);
                        }

                        // Other errors → treat as failure
                        console.error("Worker Error:", err.code, err.message);

                        return reject(err); // retry (based on attempts config)
                    }

                    // 5. Success → job completed
                    console.log("Notification sent successfully");

                    // Resolve → BullMQ marks job as completed
                    resolve(response);
                }
            );
        });
    },
    {
        connection: {
            host: NOTIFICATION_WORKER_HOST,
            port: NOTIFICATION_WORKER_PORT
        },
    }
);