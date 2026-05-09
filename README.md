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
│   │   │   └── redisRateLimiter.js
│   │   ├── services/
│   │   │   └── grpcClient.js
│   │   └── config/
│   │       └── redis.js
│   └── package.json
├── notification-service/
│   ├── index.js (gRPC server)
│   └── package.json
├── proto/
│   └── notification.proto (gRPC contracts)
└── README.md
```

---

## 🔧 Implemented Features

* ✅ Express API Gateway on port 3000
* ✅ Health check endpoint (`GET /api/health`)
* ✅ Rate limiting middleware using Redis
* ✅ Notification endpoint (`POST /api/notify`)
* ✅ gRPC service definition with proto files
* ✅ gRPC Notification Service implementation

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
