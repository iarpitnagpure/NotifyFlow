import grpc from "@grpc/grpc-js";
import grpcClient from "../services/grpcClient.js";

export const notifyController = (req, res) => {
    // 1. Extract request payload from client
    const { userId, type, message } = req.body;

    // 2. Basic validation (reject bad requests early)
    if (!userId || !type || !message) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }

    // 3. Set gRPC deadline (timeout)
    // Prevents API from waiting indefinitely if service is slow/down
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 2);

    // 4. Call gRPC Notification Service
    grpcClient.SendNotification(
        { userId, type, message },                  // request payload

        { deadline },                               // gRPC timeout: fail request if no response within specified time

        // 5. Handle gRPC response
        (err, response) => {

            // 6. Handle errors from gRPC service
            if (err) {
                // gRPC call failed → check error type
                
                // Deadline exceeded → service is slow (did not respond in time)
                if (err.code === grpc.status.DEADLINE_EXCEEDED) {
                    console.error("gRPC Timeout:", err.code, err.message);

                    // Return 503 → downstream service unavailable / too slow
                    return res.status(503).json({
                        error: "Notification service unavailable",
                    });
                }

                // Any other gRPC error (e.g. UNAVAILABLE, INTERNAL)
                console.error("gRPC Error:", err.code, err.message);

                // Return 500 → generic failure
                return res.status(500).json({
                    error: "Failed to process notification",
                });
            }

            // 7. Success → send response back to client
            res.json(response);
        }
    );
};
