# 🚀 NotifyFlow

A scalable, rate-limited, event-driven notification system built using Node.js, Redis, gRPC, and Kafka.

---

## 🧠 Overview

NotifyFlow is a backend system designed to handle high-throughput notification requests (Email/SMS) efficiently and reliably.

It demonstrates modern backend architecture patterns including:

* API Gateway
* Rate Limiting
* gRPC-based microservices
* Event-driven processing with Kafka
* Asynchronous workers

---

## ⚡ How It Works

1. Client sends a notification request
2. API Gateway validates request & applies rate limiting (Redis)
3. Request is forwarded to internal services via gRPC
4. Notification Service publishes event to Kafka
5. Worker consumes event and processes notification

---

## 🔁 Flow Diagram

```
Client
  ↓
API Gateway
  ↓
Redis (Rate Limiting)
  ↓
gRPC Services
  ↓
Kafka
  ↓
Worker
  ↓
Notification Sent
```

---

## 🏗️ Tech Stack

* Node.js (Backend Services)
* Redis (Rate Limiting, Caching)
* gRPC (Service-to-Service Communication)
* Kafka (Event Streaming)
* Docker (Containerization)

---

## 🔧 Features

* 🚦 Rate Limiting (per user/IP using Redis)
* ⚡ High-performance gRPC communication
* 🟠 Event-driven architecture using Kafka
* 🧵 Asynchronous background processing
* 🔁 Retry mechanism for failed jobs (optional)
* 💀 Dead Letter Queue support (optional)
* 📊 Logging & monitoring (extendable)

---

## 📁 Project Structure

```
notifyflow/
├── api-gateway/
├── notification-service/
├── user-service/
├── worker-service/
├── proto/
├── docker-compose.yml
```

---

## 🧪 API Example

### Send Notification

```
POST /notify
```

**Request Body**

```
{
  "userId": 1,
  "type": "email",
  "message": "Hello"
}
```

---

## 🚀 Getting Started

### Prerequisites

* Docker & Docker Compose installed

---

### Run the Project

```
docker-compose up --build
```

---

### Services

* API Gateway → http://localhost:3000
* Kafka → localhost:9092
* Redis → localhost:6379

---

## 🎯 Learning Objectives

This project helps in understanding:

* Distributed system design
* Rate limiting strategies
* Event-driven architecture
* Microservices communication (gRPC)
* Asynchronous job processing

---

## 💬 Interview Pitch

> NotifyFlow is a production-style backend system that demonstrates rate limiting with Redis, internal service communication using gRPC, and asynchronous event processing via Kafka.

---

## 📌 Future Enhancements

* Authentication & Authorization
* Priority queues
* Real email/SMS integration
* Observability (metrics, tracing)
* Circuit breaker pattern

---

## 🧑‍💻 Author

Your Name
