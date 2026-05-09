// Flow:
// 1. Request comes in
// 2. Identify user (userId or IP)
// 3. Generate Redis key
//    e.g. rate:user123
// 4. Increment request count (INCR)
//    → atomic operation (safe under concurrency)
// 5. If first request (count === 1)
//    → set TTL (start time window)
// 6. Check limit
//    ❌ If count > limit → return 429 (Too Many Requests)
//    ✅ Else → continue
// 7. Request moves to controller
// 8. After TTL expires
//    → Redis auto deletes key
//    → counter resets
// 9. If Redis fails
//    → fail-open (allow request to proceed)

// 👉 Key idea:
// Count requests per user within a fixed time window

import redisClient from "../config/redis.js";

const REQUEST_LIMIT = 5;                    // Max allowed requests per window
const REQUEST_TIMEOUT = 60;                 // Time window in seconds

const redisRateLimiter = async (req, res, next) => {
    try {
        // Identify user (prefer userId, fallback to IP)
        const userId = req.body.userId || req.ip;

        // Redis key for tracking request count per user
        const key = `rate:${userId}`;

        // Atomically increment request count
        // INCR is atomic → safe in distributed systems
        const current = await redisClient.incr(key);

        // If first request, set expiry (start time window)
        // This ensures counter resets after REQUEST_TIMEOUT seconds
        if (current === 1) {
            await redisClient.expire(key, REQUEST_TIMEOUT);
        }

        // If request count exceeds limit → block request
        if (current > REQUEST_LIMIT) {
            return res.status(429).json({
                error: 'Too many requests'
            });
        }

        // Allow request to proceed
        next();
    } catch (err) {
        // If Redis fails, log error
        console.error(err);

        // Fail-open strategy:
        // Allow request instead of blocking system
        // (important design decision for availability)
        next();
    }
};

export default redisRateLimiter;