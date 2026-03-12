import express from 'express';
import { collectIKDEvents } from '../controller/ikdController.js';
import { protect as verifyToken } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for IKD batch ingestion (15 requests per minute per IP)
// Because our frontend sends a batch every 30 seconds, 15/min gives huge headroom
// while structurally blocking DDoS or script-kiddie spam.
const ikdLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: { error: 'Too many IKD requests from this IP, please try again later.' }
});

// POST /api/ikd/collect
// Authenticated endpoint to receive and store IKD telemetry batches
router.post('/collect', verifyToken, ikdLimiter, collectIKDEvents);

export default router;
