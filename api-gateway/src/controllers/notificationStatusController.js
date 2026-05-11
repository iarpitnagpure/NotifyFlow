import notificationQueue from "../queue/notificationQueue.js";

// Controller to fetch job status from BullMQ
// Used to track async notification processing
const notificationStatusController = async (req, res) => {
    // 1. Get jobId from request params
    const { notificationId } = req.params;

    // 2. Fetch job from queue (stored in Redis via BullMQ)
    const job = await notificationQueue.getJob(notificationId);

    // 3. If job not found → return 404
    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }

    // 4. Get current job state (waiting, active, completed, failed)
    const state = await job.getState();

    // 5. Return job status with result/error if available
    res.json({
        status: state,
        result: job.returnvalue || null,
        error: job.failedReason || null,
    });
};

export default notificationStatusController;
