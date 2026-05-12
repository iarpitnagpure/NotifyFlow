import userGrpcClient from "../services/userGrpcClient.js";

const userController = (req, res) => {
    // 1. Extract request payload from client
    const { userId } = req.params;

    // 2. Basic validation (reject bad requests early)
    if (!userId) {
        return res.status(400).json({
            error: "Missing userId fields"
        });
    }

    // ❌ SYNC APPROACH (gRPC)
    // - Blocking request (client waits)
    // - Used when immediate response is required
    // - Not suitable for slow/non-critical tasks like notifications
    // 3. Set gRPC deadline (timeout)
    // Prevents API from waiting indefinitely if service is slow/down
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 2);

    // 4. Call gRPC Notification Service
    userGrpcClient.GetUser(
        { userId },                                 // request payload

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
                        error: "User service unavailable",
                    });
                }

                // Any other gRPC error (e.g. UNAVAILABLE, INTERNAL)
                console.error("gRPC Error:", err.code, err.message);

                // Return 500 → generic failure
                return res.status(500).json({
                    error: "Failed to process request at this moment",
                });
            }

            // 7. Success → send response back to client
            res.json(response);
        }
    );
}

export default userController;
