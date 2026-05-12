# 🚀 NotifyFlow

A scalable, rate-limited notification system built using Node.js, Redis, and gRPC microservices.

---

## 🧠 Overview

NotifyFlow is a scalable, event-driven notification system built with Node.js microservices. It uses async job queuing (BullMQ) for reliable, non-blocking notification processing.

Currently implemented features:

* API Gateway with Express.js
* Rate Limiting middleware using Redis
* Idempotency & duplicate request prevention
* Async job queue (BullMQ) for background processing
* Notification Worker service for async job processing
* gRPC-based Notification Service
* gRPC-based User Service for user management
* Health check endpoints
* User endpoints for user lookup

---

## ⚡ Current Architecture

```
Client Request
  ↓
API Gateway (Express)
  ↓
Idempotency Middleware (Redis cache)
  ↓
Rate Limiter (Redis counter)
  ↓
Controller
  ↓
BullMQ Queue (Redis)
  ↓ [Async Processing]
Notification Worker
  ↓
gRPC Client
  ↓
Notification Service

Response to Client: ✅ Job Accepted (202 Accepted)
→ Processing happens asynchronously in background
```

---

## 🏗️ Tech Stack

* **Node.js** (Backend Services)
* **Express.js** (API Gateway)
* **BullMQ** (Job Queue for async processing)
* **Redis** (Queue, Rate Limiting, Caching, Idempotency)
* **gRPC** (Service-to-Service Communication)
* **Protocol Buffers** (Service contracts)

---

## 📁 Project Structure

```
NotifyFlow/
├── api-gateway/
│   ├── src/
│   │   ├── index.js (Express server)
│   │   ├── routes/
│   │   │   ├── health.js
│   │   │   ├── notify.js
│   │   │   └── user.js
│   │   ├── controllers/
│   │   │   ├── healthController.js
│   │   │   ├── notifyController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── idempotency.js (Duplicate request handling)
│   │   │   └── redisRateLimiter.js (Request throttling)
│   │   ├── services/
│   │   │   └── grpcClient.js (gRPC client)
│   │   ├── queue/
│   │   │   └── notificationQueue.js (BullMQ producer)
│   │   ├── config/
│   │   │   └── redis.js (Redis connection)
│   │   └── index.js
│   └── package.json
├── notification-service/
│   ├── index.js (gRPC server)
│   └── package.json
├── user-service/
│   ├── index.js (gRPC User Service server)
│   └── package.json
├── notification-worker/
│   ├── worker.js (BullMQ consumer - job processor)
│   ├── services/
│   │   └── grpcClient.js (gRPC client for worker)
│   ├── .env
│   └── package.json
├── proto/
│   ├── notification.proto (Notification service contract)
│   └── user.proto (User service contract)
├── .gitignore
└── README.md
```

---

## 🔧 Implemented Features

* ✅ **Express API Gateway** on port 3000
* ✅ **Health check endpoint** (`GET /api/health`)
* ✅ **Notification endpoint** (`POST /api/notify`) - Enqueue async jobs
* ✅ **Job Status endpoint** (`GET /api/notify/status/:notificationId`) - Poll job progress
  - Track job state: waiting, active, completed, failed
  - Returns job result on success
  - Returns error details on failure
  - 404 for non-existent job IDs
* ✅ **User endpoint** (`GET /api/user/:userId`) - Lookup user information
  - Returns user details: email, phone, preferred channel
  - 404 for non-existent users
* ✅ **Idempotency Middleware** - Prevents duplicate request processing using `Idempotency-Key` header
  - Caches responses for 5 minutes (configurable)
  - Atomic request locking to prevent race conditions
  - Response stored in Redis for automatic replay
* ✅ **Rate Limiting Middleware** - Throttles requests using Redis
  - Configurable per-user or per-IP limiting
  - 5 requests per 60-second window (configurable)
  - Atomic counter operations for distributed safety
* ✅ **Async Job Queue** using BullMQ
  - Enqueue notification jobs from API Gateway
  - Non-blocking request/response (returns 202 Accepted)
  - Improves API responsiveness and scalability
* ✅ **Notification Worker** - Async job processor
  - Listens to BullMQ queue for notification jobs
  - Automatic retry with exponential backoff (3 attempts)
  - gRPC deadline enforcement (2-second timeout)
  - Error handling and graceful job failure
  - Graceful fallback if Redis is unavailable
* ✅ **gRPC Error Handling** in Worker
  - Deadline exceeded (timeout) → logs and retries
  - Connection failures → logs and retries
  - Max retry attempts with exponential backoff
* ✅ **gRPC service definitions** with proto files
* ✅ **gRPC Notification Service** implementation on port 50051
* ✅ **gRPC User Service** implementation on port 50052
* ✅ **CORS support** for cross-origin requests
* ✅ **Environment variable configuration** via `.env` files

---

## 🧪 API Endpoints

### Health Check

```
GET /api/health
```

---
### Get User

```
GET /api/user/:userId
```

Retrieve user information from the User Service via gRPC.

**Path Parameters**

- `userId` (required): The unique identifier for the user

**Response (User Found)**

```json
{
  "exists": true,
  "userId": "user123",
  "email": "user123@example.com",
  "phone": "+1234567890",
  "preferredChannel": "email"
}
```
Status Code: `200`

**Response (User Not Found)**

```json
{
  "error": "User not found"
}
```
Status Code: `404`

**Response (Rate Limited)**

```json
{
  "error": "Too many requests"
}
```
Status Code: `429`

---
### Send Notification

```
POST /api/notify
```

**Request Body**

```json
{
  "userId": "user123",
  "type": "email",
  "message": "Hello, this is a notification"
}
```

**Response (Accepted - Job Queued)**

```json
{
  "jobId": "12345",
  "message": "Notification job queued successfully"
}
```
Status Code: `202` (Accepted - job queued for async processing)

**Response (Rate Limited)**

```json
{
  "error": "Too many requests"
}
```
Status Code: `429`

**Response (Missing Fields)**

```json
{
  "error": "Missing required fields"
}
```
Status Code: `400`

**Response (Service Error)**

```json
{
  "error": "Failed to queue notification"
}
```
Status Code: `500` (Internal error - job queuing failed)

**Headers (Optional)**

```
Idempotency-Key: <unique-key>
```
Use this header to make the request idempotent. Subsequent requests with the same key within 5 minutes will return the cached response.

---
### Get Notification Status

```
GET /api/notify/status/:notificationId
```

Track the status of an async notification job. Use the `jobId` returned from the POST request to poll the job status.

**Path Parameters**

- `notificationId` (required): The job ID returned from the POST `/api/notify` request

**Response (Job Waiting in Queue)**

```json
{
  "status": "waiting",
  "result": null,
  "error": null
}
```
Status Code: `200`

**Response (Job Currently Processing)**

```json
{
  "status": "active",
  "result": null,
  "error": null
}
```
Status Code: `200`

**Response (Job Completed Successfully)**

```json
{
  "status": "completed",
  "result": {
    "message": "Notification queued"
  },
  "error": null
}
```
Status Code: `200`

**Response (Job Failed After All Retries)**

```json
{
  "status": "failed",
  "result": null,
  "error": "4 DEADLINE_EXCEEDED: Deadline exceeded after 2.005s,LB pick: 0.001s,remote_addr=0.0.0.0:50051"
}
```
Status Code: `200`

**Response (Job Not Found)**

```json
{
  "error": "Job not found"
}
```
Status Code: `404` (Job ID doesn't exist or has expired from queue)

---
## � Middleware Pipeline

The notification endpoint processes requests through the following middleware chain:

1. **Idempotency Middleware**
   - Checks if request with same `Idempotency-Key` exists in cache
   - If found → returns cached response (skips all processing)
   - If not found → creates a lock and continues
   - After controller responds → caches response for 5 minutes

2. **Rate Limiter Middleware**
   - Skipped if idempotent request was cached
   - Increments request counter for user in Redis
   - Checks if requests exceed limit (5 per 60 seconds)
   - If exceeded → returns 429 Too Many Requests
   - Otherwise → continues to controller

3. **Controller**
   - Validates request body (userId, type, message required)
   - Returns 400 if validation fails
   - Sets gRPC deadline (2-second timeout)
   - Calls gRPC Notification Service
   - **Handles gRPC errors:**
     - Deadline exceeded → 503 Service Unavailable
     - Connection failure → 500 Internal Server Error

4. **gRPC Service**
   - Processes notification request
   - Logs notification details
   - Returns response to controller

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Redis (running locally or via Docker)

---

### Installation

1. Clone the repository
2. Install dependencies for each service:

```bash
# API Gateway
cd api-gateway
npm install

# User Service
cd ../user-service
npm install

# Notification Service
cd ../notification-service
npm install

# Notification Worker
cd ../notification-worker
npm install
```

---

### Environment Variables

Create `.env` files in all services:

**api-gateway/.env**
```
APP_PORT=3000
GRPC_HOST=localhost
GRPC_PORT=50051
USER_SERVICE_GRPC_HOST=localhost
USER_SERVICE_GRPC_PORT=50052
REDIS_HOST=localhost
REDIS_PORT=6379
NOTIFICATION_WORKER_HOST=localhost
NOTIFICATION_WORKER_PORT=6379
```

**user-service/.env**
```
USER_SERVICE_GRPC_HOST=localhost
USER_SERVICE_GRPC_PORT=50052
```

**notification-service/.env**
```
GRPC_HOST=localhost
GRPC_PORT=50051
```

**notification-worker/.env**
```
GRPC_HOST=localhost
GRPC_PORT=50051
NOTIFICATION_WORKER_HOST=localhost
NOTIFICATION_WORKER_PORT=6379
```

---

### Run Services

```bash
# Terminal 1: Start Redis (if not already running)
redis-server

# Terminal 2: API Gateway (runs on port 3000)
cd api-gateway
npm start

# Terminal 3: User Service (runs on port 50052)
cd user-service
npm start

# Terminal 4: Notification Service (runs on port 50051)
cd notification-service
npm start

# Terminal 5: Notification Worker (async job processor)
cd notification-worker
npm start
```

---

### Services Running At

* API Gateway → http://localhost:3000
* Redis → localhost:6379
* gRPC User Service → localhost:50052
* gRPC Notification Service → localhost:50051
* Notification Worker → Listens to Redis queue (no exposed port)

---

## 🎯 Learning Objectives

This project demonstrates:

* API Gateway pattern
* Rate limiting strategies with Redis
* gRPC for service-to-Service communication
* Proto buffer service contracts
* Middleware pattern in Express.js
* **Async job queuing with BullMQ**
* **Background worker pattern for non-blocking processing**
* **Idempotency and duplicate request prevention**
* **Exponential backoff retry strategies**
* **Distributed system architecture with Redis communication**

---

## 📌 Future Enhancements

* Kafka integration for event streaming
* Authentication & Authorization
* Error handling and retry mechanisms
* Logging & monitoring
* Docker containerization
* Observability (metrics, tracing)

---

## 🧑‍💻 Author

Arpit Nagpure
