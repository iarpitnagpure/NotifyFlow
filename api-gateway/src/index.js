import 'dotenv/config';
import express from 'express';

import healthRouter from './routes/health.js';
import notifyRouter from './routes/notify.js';

const APPPORT = process.env.APP_PORT || 3000;
const app = express();

app.use(express.json());

// Health check
app.use('/api/health', healthRouter);
// Notification
app.use('/api/notify', notifyRouter);

app.listen(APPPORT, () => {
    console.log(`API Gateway running on port ${APPPORT}`);
});
