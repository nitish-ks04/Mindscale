import behavioralInsightsManager from './BehavioralInsightsManager';
import appActivityMonitor from './AppActivityMonitor';
import ikdBufferManager from './IKDBufferManager';

export interface IKDEventPayload {
    sessionId: string;
    timestamp: number;
    ikd: number;
}

/**
 * IKDEventCollector
 * 
 * Collects inter-keystroke dynamics (IKD) data securely.
 */
class IKDEventCollector {
    private buffer: IKDEventPayload[];
    private previousTimestamp: number | null;
    private sessionId: string;
    private boundListeners: WeakMap<HTMLElement, { handleKeyDown: (e: KeyboardEvent) => void, handlePaste: (e: Event) => void }>;
    private ignoredKeys: Set<string>;

    constructor() {
        this.buffer = [];
        this.previousTimestamp = null;
        this.sessionId = this._generateSessionId();

        // Use WeakMap to store bound listener references to allow precise removal
        this.boundListeners = new WeakMap();

        // Specific keys to ignore
        this.ignoredKeys = new Set([
            'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'
        ]);

        // Subscribe to app activity to handle backgrounding properly
        appActivityMonitor.subscribe((isActive) => {
            if (!isActive) {
                // If app goes to background, pause IKD collection by resetting timestamp
                this.previousTimestamp = null;
            }
        });
    }

    /**
     * Internal: Generates a session ID to group IKD events
     */
    private _generateSessionId(): string {
        return 'ikd_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }

    /**
     * Attaches tracking to a specific container or input DOM element.
     * @param {HTMLElement} element - The specific container/input to track.
     */
    attach(element: HTMLElement | null) {
        if (!element || !(element instanceof HTMLElement)) {
            console.warn('IKDEventCollector: Cannot attach to invalid element.');
            return;
        }

        // Only attach if not already attached
        if (this.boundListeners.has(element)) {
            return;
        }

        const handleKeyDown = this._handleKeyDown.bind(this);
        const handlePaste = this._handlePaste.bind(this);

        this.boundListeners.set(element, { handleKeyDown, handlePaste });

        element.addEventListener('keydown', handleKeyDown);
        element.addEventListener('paste', handlePaste);
    }

    /**
     * Detaches tracking from a specific container.
     * @param {HTMLElement} element 
     */
    detach(element: HTMLElement | null) {
        if (!element || !this.boundListeners.has(element)) return;

        const listeners = this.boundListeners.get(element);
        if (listeners) {
            element.removeEventListener('keydown', listeners.handleKeyDown);
            element.removeEventListener('paste', listeners.handlePaste);
        }

        this.boundListeners.delete(element);
    }

    /**
     * Gets the current buffer of collected IKD events.
     * @returns {IKDEventPayload[]} Array of collected objects
     */
    getBuffer(): IKDEventPayload[] {
        return [...this.buffer];
    }

    /**
     * Clears the current buffer.
     */
    clearBuffer() {
        this.buffer = [];
    }

    /**
     * Internal: Handles paste events (ignores typing completely during a paste).
     */
    private _handlePaste() {
        // Reset timestamp on paste so the next keystroke isn't falsely linked
        this.previousTimestamp = null;
    }

    /**
     * Internal: Core keystroke logic
     */
    private _handleKeyDown(e: KeyboardEvent) {
        // 1. Check strict enablement conditions
        if (!behavioralInsightsManager.behavioralInsightsEnabled || !appActivityMonitor.isAppActive()) {
            this.previousTimestamp = null;
            return;
        }

        // 2. Ignore modifier/meta keys
        if (this.ignoredKeys.has(e.key)) {
            return;
        }

        const currentTimestamp = performance.now();

        // 3. Gap check logic (> 5000ms resets tracking)
        if (this.previousTimestamp !== null) {
            const gap = currentTimestamp - this.previousTimestamp;

            if (gap > 5000) {
                this.previousTimestamp = null;
            }
        }

        // 4. Calculate IKD and push to buffer if legitimate
        if (this.previousTimestamp !== null) {
            const ikd = currentTimestamp - this.previousTimestamp;

            if (ikd >= 20 && ikd <= 2000) {
                // DO NOT capture the key value directly for privacy, just mechanics
                const event = {
                    sessionId: this.sessionId,
                    timestamp: currentTimestamp,
                    ikd: ikd
                };

                // Add to array memory for manual viewing if needed
                this.buffer.push(event);

                // Dispatch directly to the network buffer manager
                ikdBufferManager.addEvent(event);
            }
        }

        // 5. Update for next stroke
        this.previousTimestamp = currentTimestamp;
    }
}

// Export as singleton
const ikdEventCollector = new IKDEventCollector();
export default ikdEventCollector;
