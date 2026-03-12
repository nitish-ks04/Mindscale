import behavioralInsightsManager from './BehavioralInsightsManager';
import appActivityMonitor from './AppActivityMonitor';

import { IKDEventPayload } from './IKDEventCollector';

/**
 * IKDBufferManager
 * 
 * Manages the batching and transmission of inter-keystroke dynamics events.
 * Transmits every 30 seconds or conditionally based on app lifecycle.
 */
class IKDBufferManager {
    private buffer: IKDEventPayload[];
    private flushIntervalId: ReturnType<typeof setInterval> | null;
    private readonly FLUSH_INTERVAL_MS: number;

    constructor() {
        this.buffer = [];
        this.flushIntervalId = null;
        this.FLUSH_INTERVAL_MS = 30000; // 30 seconds

        // Subscribe to app activity changes to handle immediate background flushing
        appActivityMonitor.subscribe((isActive) => {
            if (!isActive) {
                // Instantly drain whatever is in memory when the app is backgrounded
                this._flushBuffer();
                this._stopTimer();
            } else if (behavioralInsightsManager.behavioralInsightsEnabled) {
                // Wake back up if enabled
                this._startTimer();
            }
        });
    }

    /**
     * Internal: Ensures only one timer is active at a time.
     */
    private _startTimer() {
        if (this.flushIntervalId !== null) return;

        console.log('IKD Buffer Manager: Timer started.');
        this.flushIntervalId = setInterval(() => {
            if (this.buffer.length > 0) {
                this._flushBuffer();
            }
        }, this.FLUSH_INTERVAL_MS);
    }

    /**
     * Internal: Halts the timer safely.
     */
    private _stopTimer() {
        if (this.flushIntervalId !== null) {
            console.log('IKD Buffer Manager: Timer stopped.');
            clearInterval(this.flushIntervalId);
            this.flushIntervalId = null;
        }
    }

    /**
     * Internal: The core flushing mechanism to send data.
     */
    private _flushBuffer() {
        if (this.buffer.length === 0) return;

        const batchToSend = [...this.buffer];
        this.buffer = []; // Clear current queue immediately to accept new keypresses

        console.log(`Sending ${batchToSend.length} IKD events to server...`, batchToSend);

        // TODO: Replace with actual FastAPI POST /ikd-batch network dispatch
        // Example structure:
        // fetch(`${process.env.VITE_API_URL}/ikd/batch`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ events: batchToSend })
        // }).catch(err => console.error('Failed to dispatch IKD batch:', err));
    }

    /**
     * Public method to push an event into the transmission queue.
     * @param {IKDEventPayload} event - The IKD event structure { timestamp, ikd, sessionId }
     */
    addEvent(event: IKDEventPayload) {
        if (!event || typeof event.ikd !== 'number') return;

        this.buffer.push(event);

        // Ensure timer starts ONLY when the very first active keystroke lands,
        // rather than blindly spinning a timer against an empty application forever.
        if (this.flushIntervalId === null && behavioralInsightsManager.behavioralInsightsEnabled) {
            this._startTimer();
        }
    }

    /**
     * Handles explicit logic triggered by a user logging out.
     */
    handleUserLogout() {
        console.log('IKD Buffer Manager: Flushing on user logout.');
        this._flushBuffer();
        this._stopTimer();
    }

    /**
     * Exposed API for manual clearing if required.
     */
    clearBuffer() {
        this.buffer = [];
    }
}

// Export as singleton
const ikdBufferManager = new IKDBufferManager();
export default ikdBufferManager;
