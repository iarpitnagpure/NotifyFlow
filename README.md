# 🚀 NotifyFlow

A scalable, rate-limited notification system built using Node.js, Redis, and gRPC microservices.

---

## 🧠 Overview

NotifyFlow is a backend system designed to handle notification requests efficiently and reliably. 

Currently implemented features:

* API Gateway with Express.js
* Rate Limiting middleware using Redis
* gRPC-based Notification Service
* Health check endpoints

---

## ⚡ Current Architecture

```
Client
  ↓
API Gateway (Express)
  ↓
Idempotency Middleware
  ↓
Rate Limiter (Redis)
  ↓
Controller
  ↓
gRPC Client
  ↓
Notification Service
  ↓
Response → back through Gateway → Client
```

---

## 🏗️ Tech Stack

* **Node.js** (Backend Services)
* **Express.js** (API Gateway)
* **Redis** (Rate Limiting)
* **gRPC** (Service-to-Service Communication)

---

## 📁 Project Structure

```
NotifyFlow/
├── api-gateway/
│   ├── src/
│   │   ├── index.js (Express server)
│   │   ├── routes/
│   │   │   ├── health.js
│   │   │   └── notify.js
│   │   ├── controllers/
│   │   │   ├── healthController.js
│   │   │   └── notifyController.js
│   │   ├── middlewares/
│   │   │   ├── idempotency.js (Duplicate request handling)
│   │   │   └── redisRateLimiter.js (Request throttling)
│   │   ├── services/
│   │   │   └── grpcClient.js (gRPC client)
│   │   └── config/
│   │       └── redis.js (Redis connection)
│   └── package.json
├── notification-service/
│   ├── index.js (gRPC server)
│   └── package.json
├── proto/
│   └── notification.proto (gRPC service contracts)
└── README.md
```

---

## 🔧 Implemented Features

* ✅ **Express API Gateway** on port 3000
* ✅ **Health check endpoint** (`GET /api/health`)
* ✅ **Idempotency Middleware** - Prevents duplicate request processing using `Idempotency-Key` header
  - Caches responses for 5 minutes (configurable)
  - Atomic request locking to prevent race conditions
  - Response stored in Redis for automatic replay
* ✅ **Rate Limiting Middleware** - Throttles requests using Redis
  - Configurable per-user or per-IP limiting
  - 5 requests per 60-second window (configurable)
  - Atomic counter operations for distributed safety
  - Graceful fallback if Redis is unavailable
* ✅ **Notification endpoint** (`POST /api/notify`)
* ✅ **gRPC service definition** with proto files
* ✅ **gRPC Notification Service** implementation on port 50051
* ✅ **gRPC Error Handling** - Graceful error responses
  - Deadline exceeded (timeout) → returns 503 Service Unavailable
  - Connection failures → returns 500 Internal Server Error
  - Proper error logging for debugging
* ✅ **CORS support** for cross-origin requests
* ✅ **Environment variable configuration** via `.env` files

---

## 🧪 API Endpoints

### Health Check

```
GET /api/health
```

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

**Response (Success)**

```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

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

**Response (Service Timeout)**

```json
{
  "error": "Notification service unavailable"
}
```
Status Code: `503` (gRPC deadline exceeded - service didn't respond within 2 seconds)

**Response (Service Error)**

```json
{
  "error": "Failed to process notification"
}
```
Status Code: `500` (gRPC connection failure or internal error)

**Headers (Optional)**

```
Idempotency-Key: <unique-key>
```
Use this header to make the request idempotent. Subsequent requests with the same key within 5 minutes will return the cached response.

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

## 🧪 Testing the API

### Test Health Endpoint

```bash
curl -X GET http://localhost:3000/api/health
```

### Test Notification Endpoint (Single Request)

```bash
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "type": "email",
    "message": "Test notification"
  }'
```

### Test Idempotency

```bash
# First request - processes normally
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-001" \
  -d '{
    "userId": "user123",
    "type": "email",
    "message": "Test notification"
  }'

# Second request with same key - returns cached response instantly
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-001" \
  -d '{
    "userId": "user123",
    "type": "email",
    "message": "Test notification"
  }'
```

### Test Rate Limiting

```bash
# Make 5 requests (should all succeed)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/notify \
    -H "Content-Type: application/json" \
    -d "{\"userId\": \"user456\", \"type\": \"sms\", \"message\": \"Test $i\"}"
done

# 6th request (should be rate limited - 429 response)
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{"userId": "user456", "type": "sms", "message": "Test 6"}'
```

### Test Error Handling

**Missing Required Fields (400)**

```bash
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

**gRPC Service Timeout (503)**

Stop the notification service while making a request:

```bash
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "type": "email",
    "message": "Test timeout"
  }'
```

Expected response after 2 seconds:
```json
{
  "error": "Notification service unavailable"
}
```

**gRPC Service Unavailable (500)**

Configure wrong gRPC host/port in `.env` and make a request:

```bash
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "type": "email",
    "message": "Test unavailable"
  }'
```

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

# Notification Service
cd ../notification-service
npm install
```

---

### Environment Variables

Create `.env` files in both services:

**api-gateway/.env**
```
APP_PORT=3000
GRPC_HOST=localhost
GRPC_PORT=50051
REDIS_HOST=localhost
REDIS_PORT=6379
```

**notification-service/.env**
```
GRPC_HOST=localhost
GRPC_PORT=50051
```

---

### Run Services

```bash
# API Gateway (runs on port 3000)
cd api-gateway
npm start

# Notification Service (runs on port 50051)
cd notification-service
npm start
```

---

### Services Running At

* API Gateway → http://localhost:3000
* Redis → localhost:6379
* gRPC Notification Service → localhost:50051

---

## 🎯 Learning Objectives

This project demonstrates:

* API Gateway pattern
* Rate limiting strategies with Redis
* gRPC for service-to-service communication
* Proto buffer service contracts
* Middleware pattern in Express.js

---

## 📌 Future Enhancements

* Kafka integration for event streaming
* Worker service for async processing
* User service for user management
* Authentication & Authorization
* Error handling and retry mechanisms
* Logging & monitoring
* Docker containerization
* Observability (metrics, tracing)

---

## 🧑‍💻 Author

Arpit Nagpure
