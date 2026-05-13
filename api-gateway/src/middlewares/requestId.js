import { randomUUID } from "crypto";

// Adds unique requestId to every request usefull for track request in logs
const requestIdMiddleware = (req, res, next) => {
    req.requestId = randomUUID();

    next();
};

export default requestIdMiddleware;
