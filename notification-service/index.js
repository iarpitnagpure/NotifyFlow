import { fileURLToPath } from 'url';
import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

const GRPCHOST = process.env.GRPC_HOST;
const GRPCPORT = process.env.GRPC_PORT;

// In ES modules, __dirname is not available by default
// So we recreate it using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path to proto file (gRPC contract)
// This file contains service + message definitions
const PROTO_PATH = path.join(__dirname, '../proto/notification.proto');

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
    }
});

// Start server and bind to GRPCPORT
server.bindAsync(
    `${GRPCHOST}:${GRPCPORT}`,                                        // Listen on all interfaces
    grpc.ServerCredentials.createInsecure(),                // No SSL (OK for local dev)
    (err, GRPCPORT) => {
        if (err) {
            console.error("Server error:", err);
            return;
        }

        console.log(`gRPC server running on GRPCPORT ${GRPCPORT}`);
    }
);