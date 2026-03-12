/**
 * BehavioralInsightsManager
 * Manages user consent and tracks conditions for Keystroke Dynamics (IKD) tracking.
 */

// Secure Storage Implementation:
// Avoids localStorage as required. Uses sessionStorage with an in-memory fallback to keep consent bounded to the current session.
const secureStorage = {
    _memoryStore: new Map<string, string>(),

    setItem(key: string, value: string) {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            this._memoryStore.set(key, value);
        }
    },

    getItem(key: string): string | undefined | null {
        try {
            return sessionStorage.getItem(key) || this._memoryStore.get(key);
        } catch (e) {
            return this._memoryStore.get(key);
        }
    },

    removeItem(key: string) {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            this._memoryStore.delete(key);
        }
    }
};

class BehavioralInsightsManager {
    public behavioralInsightsEnabled: boolean;
    private readonly CONSENT_KEY: string;

    constructor() {
        this.behavioralInsightsEnabled = false;
        this.CONSENT_KEY = 'ikd_consent_timestamp';

        // Restore state if consent was previously given in this session
        const savedConsent = secureStorage.getItem(this.CONSENT_KEY);
        if (savedConsent) {
            this.behavioralInsightsEnabled = true;
        }
    }

    /**
     * Enables behavioral insights tracking if explicit user consent is provided.
     * @param {boolean} explicitConsent - Must be true to enable tracking.
     */
    enableBehavioralInsights(explicitConsent: boolean): boolean {
        if (explicitConsent === true) {
            this.behavioralInsightsEnabled = true;
            const timestamp = new Date().toISOString();

            // Store consent securely (session-bound)
            secureStorage.setItem(this.CONSENT_KEY, timestamp);
            console.log(`Behavioral insights enabled at ${timestamp}`);
            return true;
        }

        console.warn("Explicit user consent is required to enable behavioral insights.");
        return false;
    }

    /**
     * Disables behavioral insights tracking and removes consent record.
     */
    disableBehavioralInsights() {
        this.behavioralInsightsEnabled = false;
        secureStorage.removeItem(this.CONSENT_KEY);
        console.log("Behavioral insights disabled.");
    }

    /**
     * Internal: Checks if the application is currently in the foreground.
     * @returns {boolean}
     */
    private _isAppInForeground(): boolean {
        return typeof document !== 'undefined' && document.visibilityState === 'visible';
    }

    /**
     * Internal: Checks if the user is actively focused on an input field or contenteditable element.
     * @returns {boolean}
     */
    private _isUserTypingInInput(): boolean {
        if (typeof document === 'undefined') return false;

        const activeElement = document.activeElement;
        if (!activeElement) return false;

        const tagName = activeElement.tagName.toLowerCase();
        const isInputOrTextarea = tagName === 'input' || tagName === 'textarea';
        const isContentEditable = (activeElement as HTMLElement).isContentEditable;

        return isInputOrTextarea || isContentEditable;
    }

    /**
     * Returns true ONLY if ALL three conditions are met:
     * 1. Insights are strictly enabled (consent given)
     * 2. The app is in the foreground
     * 3. The user is actively typing in an input field
     * 
     * @returns {boolean}
     */
    isBehavioralTrackingActive(): boolean {
        return Boolean(
            this.behavioralInsightsEnabled &&
            this._isAppInForeground() &&
            this._isUserTypingInInput()
        );
    }
}

// Export as a singleton instance
const behavioralInsightsManager = new BehavioralInsightsManager();
export default behavioralInsightsManager;
