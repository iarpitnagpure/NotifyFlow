import grpc from "@grpc/grpc-js";
// import notificationGrpcClient from "../services/notificationGrpcClient.js";
import notificationQueue from "../queue/notificationQueue.js";
import logger from "../config/logger.js";

export const notificationController = async (req, res) => {
    // 1. Extract request payload from client
    const { userId, type, message } = req.body;

    logger.info(
        { requestId: req.requestId, userId, type },
        "Received notification request"
    );

    // 2. Basic validation (reject bad requests early)
    if (!userId || !type || !message) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }

    // ✅ ASYNC APPROACH (BullMQ)
    // - Non-blocking request
    // - Suitable for background tasks (notifications, emails, etc.)
    // - Improves scalability and reliability
    try {
        logger.info(
            { requestId: req.requestId, userId },
            "Queuing notification job"
        );

        // 3. Push job to queue (async processing)
        const job = await notificationQueue.add(
            "send_notification",
            { userId, type, message },
            {
                attempts: 3,                                // retry on failure
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            }
        );

        logger.info(
            { requestId: req.requestId, jobId: job.id },
            "Notification job queued"
        );

        // 4. Return immediate response (do not wait for processing)
        res.json({
            status: "queued",
            jobId: job.id,                                  // useful for tracking later
        });
    } catch (err) {
        // 5. Queue failure (rare but possible)
        logger.error(
            { requestId: req.requestId, err },
            "Failed to queue notification"
        );

        return res.status(500).json({
            error: "Failed to queue notification",
        });
    }

    // ❌ SYNC APPROACH (gRPC)
    // - Blocking request (client waits)
    // - Used when immediate response is required
    // - Not suitable for slow/non-critical tasks like notifications
    // // 3. Set gRPC deadline (timeout)
    // // Prevents API from waiting indefinitely if service is slow/down
    // const deadline = new Date();
    // deadline.setSeconds(deadline.getSeconds() + 2);

    // // 4. Call gRPC Notification Service
    // notificationGrpcClient.SendNotification(
    //     { userId, type, message },                  // request payload

    //     { deadline },                               // gRPC timeout: fail request if no response within specified time

    //     // 5. Handle gRPC response
    //     (err, response) => {

    //         // 6. Handle errors from gRPC service
    //         if (err) {
    //             // gRPC call failed → check error type

    //             // Deadline exceeded → service is slow (did not respond in time)
    //             if (err.code === grpc.status.DEADLINE_EXCEEDED) {
    //                   logger.error(
    //                       { requestId: req.requestId, err: err.code, message: err.message },
    //                   "gRPC Timeout:"
    //                   );

    //                 // Return 503 → downstream service unavailable / too slow
    //                 return res.status(503).json({
    //                     error: "Notification service unavailable",
    //                 });
    //             }

    //             // Any other gRPC error (e.g. UNAVAILABLE, INTERNAL)
    //             logger.error(
    //                 { requestId: req.requestId, err: err.code, message: err.message },
    //                 "gRPC Error:"
    //             );

    //             // Return 500 → generic failure
    //             return res.status(500).json({
    //                 error: "Failed to process notification",
    //             });
    //         }

    //         // 7. Success → send response back to client
    //         res.json(response);
    //     }
    // );
};
