import { fileURLToPath } from 'url';
import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const USER_SERVICE_GRPC_HOST = process.env.USER_SERVICE_GRPC_HOST;
const USER_SERVICE_GRPC_PORT = process.env.USER_SERVICE_GRPC_PORT

// In ES modules, __dirname is not available by default
// So we recreate it using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path to proto file (gRPC contract)
// This file contains service + message definitions
const PROTO_PATH = path.join(__dirname, '../../../proto/user.proto');

// Load proto file definition
// This parses the .proto file into a usable JS object
const packageDef = protoLoader.loadSync(PROTO_PATH);

// Convert loaded definition into gRPC object
const grpcObject = grpc.loadPackageDefinition(packageDef);

// Create gRPC client instance
// This acts like a "remote service caller"
const userGrpcClient = new grpcObject.UserService(
    `${USER_SERVICE_GRPC_HOST}:${USER_SERVICE_GRPC_PORT}`,              // Address of gRPC server
    grpc.credentials.createInsecure()                                   // No SSL (OK for local dev)
);

// Export client to use in routes/controllers
export default userGrpcClient;
