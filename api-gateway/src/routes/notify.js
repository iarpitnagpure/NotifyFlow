// Middleware Flow:
// If Idempotency-Key present:
//   → handled by idempotency
//   → may skip rate limiter
// If Idempotency-Key NOT present:
//   → goes to rate limiter

import { Router } from 'express';
import { notifyController } from '../controllers/notifyController.js';
import redisRateLimiter from '../middlewares/redisRateLimiter.js';
import idempotency from '../middlewares/idempotency.js';

const notifyRouter = Router();

notifyRouter.post(
    '/',
    idempotency,
    redisRateLimiter,
    notifyController
);

export default notifyRouter;
