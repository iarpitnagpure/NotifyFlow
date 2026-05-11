// Middleware Flow:
// If Idempotency-Key present:
//   → handled by idempotency
//   → may skip rate limiter
// If Idempotency-Key NOT present:
//   → goes to rate limiter

import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import redisRateLimiter from '../middlewares/redisRateLimiter.js';
import idempotency from '../middlewares/idempotency.js';
import notificationStatusController from '../controllers/notificationStatusController.js';

const notifyRouter = Router();

notifyRouter.post(
    '/',
    idempotency,
    redisRateLimiter,
    notificationController
);

notifyRouter.get(
    '/status/:notificationId',
    notificationStatusController
);

export default notifyRouter;
