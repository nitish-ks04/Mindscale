import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import IKDEvent from '../models/IKDEvent.js';

export const collectIKDEvents = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const { events } = req.body;

        if (!events || !Array.isArray(events)) {
            return res.status(400).json({ error: 'Payload must contain an array of events' });
        }

        const validEvents = [];
        let rejectedCount = 0;

        for (const event of events) {
            // 1. Reject if payload contains restricted string captures
            if ('key' in event || 'character' in event || 'text' in event) {
                rejectedCount++;
                continue;
            }

            // 2. Validate IKD bounds
            if (typeof event.ikd !== 'number' || event.ikd <= 20 || event.ikd >= 2000) {
                rejectedCount++;
                continue;
            }

            // 3. Ensure essential fields exist
            if (!event.timestamp || !event.sessionId) {
                rejectedCount++;
                continue;
            }

            // 4. Attach authenticated user ID
            // Note: req.user should be populated by the verifyToken middleware
            if (!req.user || !req.user._id) {
                rejectedCount++;
                continue;
            }

            validEvents.push({
                userId: req.user._id,
                sessionId: event.sessionId,
                timestamp: event.timestamp,
                ikd: event.ikd
            });
        }

        if (validEvents.length === 0) {
            return res.status(400).json({
                error: 'No valid events to store',
                rejected: rejectedCount
            });
        }

        // 5. Store in database
        const result = await IKDEvent.insertMany(validEvents);

        // 6. Log number of events stored
        console.log(`[IKD] Stored ${result.length} valid events for User ${req.user?._id}. Rejected: ${rejectedCount}`);

        // 7. Return success count
        return res.status(200).json({
            message: 'IKD events successfully stored',
            storedCount: result.length,
            rejectedCount: rejectedCount
        });

    } catch (error) {
        console.error('Error collecting IKD events:', error);
        return res.status(500).json({ error: 'Internal server error while processing IKD events' });
    }
};
