import { fileURLToPath } from 'url';
import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

const NOTIFICATION_SERVICE_GRPC_HOST = process.env.NOTIFICATION_SERVICE_GRPC_HOST;
const NOTIFICATION_SERVICE_GRPC_PORT = process.env.NOTIFICATION_SERVICE_GRPC_PORT;

// In ES modules, __dirname is not available by default
// So we recreate it using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path to proto file (gRPC contract)
// This file contains service + message definitions
// const PROTO_PATH = path.join(__dirname, '../proto/notification.proto');
// Take path from Docker
const PROTO_PATH = path.join(process.cwd(), 'proto', 'notification.proto');

// Load proto file (defines service + messages)
const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

// Convert proto definition into gRPC object
const grpcObject = grpc.loadPackageDefinition(packageDef);

// If you had `package xyz;` in proto, you'd access like:
// grpcObject.xyz.NotificationService
const notificationPackage = grpcObject;

// Create gRPC server instance
const server = new grpc.Server();

// Register service + its implementation
server.addService(notificationPackage.NotificationService.service, {

    // This function runs when client calls SendNotification
    SendNotification: (call, callback) => {

        // Extract request data from client
        const { userId, type, message } = call.request;

        // Log received request (for debugging)
        console.log("Received:", userId, type, message);

        // TODO: Later → push to Kafka instead of just logging

        // Send response back to client
        callback(null, { status: "Notification queued" });

        // Simulate slow notification service to test gRPC timeout handling
        // Delay response by 5 seconds (greater than gateway deadline)
        // This should trigger DEADLINE_EXCEEDED error in API Gateway
        // setTimeout(() => {
        //     callback(null, { status: "Notification queued" });
        // }, 5000);
    }
});

// Start server and bind to NOTIFICATION_SERVICE_GRPC_PORT
server.bindAsync(
    `${NOTIFICATION_SERVICE_GRPC_HOST}:${NOTIFICATION_SERVICE_GRPC_PORT}`,                                          // Listen on all interfaces
    grpc.ServerCredentials.createInsecure(),                            // No SSL (OK for local dev)
    (err, NOTIFICATION_SERVICE_GRPC_PORT) => {
        if (err) {
            console.error("Server error:", err);
            return;
        }

        console.log(`gRPC server running on NOTIFICATION_SERVICE_GRPC_PORT ${NOTIFICATION_SERVICE_GRPC_PORT}`);
    }
);