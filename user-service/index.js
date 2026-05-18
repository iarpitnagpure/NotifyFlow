import { fileURLToPath } from 'url';
import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

const USER_SERVICE_GRPC_HOST = process.env.USER_SERVICE_GRPC_HOST;
const USER_SERVICE_GRPC_PORT = process.env.USER_SERVICE_GRPC_PORT;

// In ES modules, __dirname is not available by default
// So we recreate it using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path to proto file (gRPC contract)
// This file contains service + message definitions
// const PROTO_PATH = path.join(__dirname, '../proto/user.proto');
// Take path from Docker
const PROTO_PATH = path.join(process.cwd(), "proto", "user.proto");

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
// grpcObject.xyz.UserService
const userPackage = grpcObject;

// Create gRPC server instance
const server = new grpc.Server();

// Register service + its implementation
server.addService(userPackage.UserService.service, {

    // This function runs when client calls GetUser
    GetUser: (call, callback) => {

        // Extract request data from client
        const { userId } = call.request;

        // Log received request (for debugging)
        console.log("Received:", userId);

        // Send response back to client
        // TODO: Handle reponse by checking userId from MongoDB
        callback(null, {
            "exists": true,
            "userId": userId,
            "email": "test@example.com",
            "phone": "9999999999",
            "preferredChannel": "email"
        });

        // Simulate slow user service to test gRPC timeout handling
        // Delay response by 5 seconds (greater than gateway deadline)
        // This should trigger DEADLINE_EXCEEDED error in API Gateway
        // setTimeout(() => {
        //     callback(null, {
        //         "exists": true,
        //         "userId": userId,
        //         "email": "test@example.com",
        //         "phone": "9999999999",
        //         "preferredChannel": "email"
        //     });
        // }, 5000);
    }
});

// Start server and bind to USER_SERVICE_GRPC_PORT
server.bindAsync(
    `${USER_SERVICE_GRPC_HOST}:${USER_SERVICE_GRPC_PORT}`,              // Listen on all interfaces
    grpc.ServerCredentials.createInsecure(),                            // No SSL (OK for local dev)
    (err, USER_SERVICE_GRPC_PORT) => {
        if (err) {
            console.error("Server error:", err);
            return;
        }

        console.log(`gRPC server running on USER_SERVICE_GRPC_PORT ${USER_SERVICE_GRPC_PORT}`);
    }
);