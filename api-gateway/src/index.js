import 'dotenv/config';
import express from 'express';

import healthRouter from './routes/health.js';
import notifyRouter from './routes/notify.js';
import userRouter from './routes/user.js';
import requestIdMiddleware from './middlewares/requestId.js';
import logger from './config/logger.js';

const APP_PORT = process.env.APP_PORT || 3000;
const app = express();

app.use(express.json());

// Request Id middlware to track request in logs
app.use(requestIdMiddleware);

// Health check
app.use('/api/health', healthRouter);
// Notification
app.use('/api/notify', notifyRouter);
// User
app.use('/api/user', userRouter);

app.listen(APP_PORT, () => {
    logger.info(`API Gateway running on port ${APP_PORT}`);
});
