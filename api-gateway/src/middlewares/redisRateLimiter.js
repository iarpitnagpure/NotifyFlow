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