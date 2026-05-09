// Flow:
// Request comes in with Idempotency-Key
// Middleware checks Redis
// ✅ Found → return cached response → controller never runs
// ❌ Not found → continue
// Middleware sets a lock (prevents duplicates)
// Middleware monkey-patches res.json
// Controller runs normally
// When controller sends response → middleware intercepts it
// Middleware stores response in Redis
// Future requests return cached response

import redisClient from "../config/redis.js";

const IDEMP_TTL = 300;                              // how long response is cached
const LOCK_TTL = 10;                                // lock duration to prevent duplicate processing

const idempotency = async (req, res, next) => {
    // 1. Read idempotency key from request
    const key = req.header("Idempotency-Key");

    if (!key) return next();                        // skip if not provided

    const redisKey = `idem:${key}`;
    const lockKey = `lock:${key}`;

    try {
        // 2. Check if response already exists in Redis
        const cached = await redisClient.get(redisKey);
        if (cached) {
            try {
                const data = JSON.parse(cached);

                // ✅ Return stored response immediately
                return res.status(data.status).json(data.body);
            } catch {
                // corrupted cache → ignore and continue
            }
        }

        // 3. Try to acquire lock (only 1 request should process)
        const lock = await redisClient.set(lockKey, "1", {
            NX: true,                               // set only if not exists
            EX: LOCK_TTL,
        });

        if (!lock) {
            // another request is already processing this key
            return res.status(409).json({
                success: false,
                message: "Request already in progress",
            });
        }

        // 4. Intercept response
        const originalJson = res.json.bind(res);
        let isHandled = false;                      // prevent multiple writes

        res.json = async (body) => {
            if (isHandled) return;

            isHandled = true;

            const responseData = {
                status: res.statusCode,
                body,
            };

            try {
                // 5. Store response in Redis
                await redisClient.set(redisKey, JSON.stringify(responseData), {
                    EX: IDEMP_TTL,
                });
            } finally {
                // 6. Always release lock
                await redisClient.del(lockKey);
            }

            // 7. Send actual response
            return originalJson(body);
        };

        // 8. Continue to controller
        next();
    } catch (err) {
        // safety: release lock if something crashes
        await redisClient.del(lockKey).catch(() => { });
        next(err);
    }
};

export default idempotency;
