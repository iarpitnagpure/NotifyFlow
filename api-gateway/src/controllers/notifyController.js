import grpcClient from "../services/grpcClient.js";

export const notifyController = (req, res) => {
    // Extract request payload
    const { userId, type, message } = req.body;

    // Basic validation (important in real systems)
    if (!userId || !type || !message) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }

    // Call gRPC service (remote procedure call)
    grpcClient.SendNotification(
        { userId, type, message },

        // Callback receives error or response from gRPC server
        (err, response) => {
            // Handle gRPC error
            if (err) {
                console.error("gRPC Error:", err);

                return res.status(500).json({
                    error: "Failed to process notification"
                });
            }

            // Send response back to client
            res.json(response);
        }
    );
};