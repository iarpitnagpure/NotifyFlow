// Middleware Flow:
// GET request → no idempotency (read operation)
// Request goes directly to rate limiter
// Then to controller

import { Router } from 'express';
import redisRateLimiter from '../middlewares/redisRateLimiter.js';
import idempotency from '../middlewares/idempotency.js';
import userController from '../controllers/userController.js';

const userRouter = Router();

userRouter.get(
    '/:userId',
    redisRateLimiter,
    userController
);

export default userRouter;
