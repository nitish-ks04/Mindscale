import behavioralInsightsManager from './BehavioralInsightsManager';
import appActivityMonitor from './AppActivityMonitor';

/**
 * KeystrokeDynamicsTracker
 * 
 * Subscribes to AppActivityMonitor and BehavioralInsightsManager 
 * to securely and correctly start/pause/resume keystroke dynamics collection.
 */
class KeystrokeDynamicsTracker {
    private isTracking: boolean;
    private collectionData: any[];
    private lastKeystrokeTime: number | null;

    constructor() {
        this.isTracking = false;
        this.collectionData = [];
        this.lastKeystrokeTime = null;

        // Subscribe to app activity changes
        appActivityMonitor.subscribe((isActive) => {
            if (isActive) {
                this._resumeTracking();
            } else {
                this._pauseTracking();
            }
        });

        this._bindKeyboardEvents();
    }

    private _bindKeyboardEvents() {
        if (typeof document === 'undefined') return;

        // Use capturing phase so we can grab events early
        document.addEventListener('keydown', this._handleKeyDown.bind(this) as EventListener, true);
        document.addEventListener('keyup', this._handleKeyUp.bind(this) as EventListener, true);
    }

    private _handleKeyDown(e: KeyboardEvent) {
        if (!this._canTrack()) return;

        const now = performance.now();
        // Record latency between previous keystroke and current
        const latency = this.lastKeystrokeTime ? now - this.lastKeystrokeTime : 0;
        this.lastKeystrokeTime = now;

        this.collectionData.push({
            type: 'keydown',
            key: e.key,
            timestamp: now,
            latency: latency
        });
    }

    private _handleKeyUp(e: KeyboardEvent) {
        if (!this._canTrack()) return;

        const now = performance.now();

        this.collectionData.push({
            type: 'keyup',
            key: e.key,
            timestamp: now
        });
    }

    /**
     * Internal: Verify if we are legally and conditionally allowed to track the current keystroke.
     */
    private _canTrack(): boolean {
        // AppActivityMonitor state and BehavioralInsightsManager criteria checks
        return this.isTracking && behavioralInsightsManager.isBehavioralTrackingActive();
    }

    /**
     * Pauses IKD collection immediately.
     */
    private _pauseTracking() {
        if (this.isTracking) {
            console.log('IKD Tracker: App backgrounded -> Pausing collection.');
            this.isTracking = false;
            // Clear lastKeystrokeTime so that when returning, we don't calculate a massive jump span.
            this.lastKeystrokeTime = null;
        }
    }

    /**
     * Resumes IKD collection.
     */
    private _resumeTracking() {
        if (!this.isTracking) {
            console.log('IKD Tracker: App foregrounded -> Resuming collection.');
            this.isTracking = true;
            // Note: `lastKeystrokeTime` intentionally remains null until the user 
            // presses their next key so we start a fresh latency cycle.
        }
    }

    /**
     * Manually start tracking (e.g., after consent is provided).
     */
    start() {
        if (behavioralInsightsManager.behavioralInsightsEnabled) {
            this.isTracking = true;
            console.log('IKD Tracker manually started.');
        } else {
            console.warn('Cannot start IKD Tracker: Behavioral Insights not enabled.');
        }
    }

    /**
     * Manually stop tracking and wipe the data buffer.
     */
    stopAndClear() {
        this.isTracking = false;
        this.lastKeystrokeTime = null;
        this.collectionData = [];
    }
}

// Export as a singleton
const keystrokeTracker = new KeystrokeDynamicsTracker();
export default keystrokeTracker;
