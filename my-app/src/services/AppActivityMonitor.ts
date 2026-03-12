/**
 * AppActivityMonitor
 * Monitors and broadcasts when the web application moves between background and foreground states.
 */

class AppActivityMonitor {
    private appIsActive: boolean;
    private listeners: Set<(isActive: boolean) => void>;

    constructor() {
        // App is assumed to be active on initialization if running in browser
        this.appIsActive = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
        this.listeners = new Set();

        this._initVisibilityListener();
    }

    /**
     * Internal: Attach the standard DOM visibilitychange event listener to track 
     * when the tab is switched or minimized.
     */
    private _initVisibilityListener() {
        if (typeof document === 'undefined') return;

        document.addEventListener('visibilitychange', () => {
            const isVisible = document.visibilityState === 'visible';

            if (isVisible !== this.appIsActive) {
                this.appIsActive = isVisible;
                this._notifyListeners();
            }
        });

        // Some mobile browsers rely on pagehide/pageshow
        window.addEventListener('pagehide', () => {
            if (this.appIsActive) {
                this.appIsActive = false;
                this._notifyListeners();
            }
        });

        window.addEventListener('pageshow', () => {
            if (!this.appIsActive) {
                this.appIsActive = true;
                this._notifyListeners();
            }
        });
    }

    /**
     * Subscribe a module/function to listen for activity changes.
     * The callback will recive the boolean (`appIsActive`)
     * 
     * @param {(isActive: boolean) => void} listener - A callback function accepting a boolean parameter.
     */
    subscribe(listener: (isActive: boolean) => void) {
        if (typeof listener === 'function') {
            this.listeners.add(listener);
        } else {
            console.warn('AppActivityMonitor: Provided listener is not a function.');
        }

        // Return an unsubscribe function
        return () => this.listeners.delete(listener);
    }

    /**
     * Unsubscribe a previously attached listener.
     * 
     * @param {(isActive: boolean) => void} listener 
     */
    unsubscribe(listener: (isActive: boolean) => void) {
        this.listeners.delete(listener);
    }

    /**
     * Broadcasts the current `appIsActive` state to all subscribers.
     */
    private _notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this.appIsActive);
            } catch (error) {
                console.error('AppActivityMonitor: Error inside subscribed listener', error);
            }
        }
    }

    /**
     * Direct getter to check the current activity state.
     * @returns {boolean}
     */
    isAppActive(): boolean {
        return this.appIsActive;
    }
}

// Export as a singleton
const appActivityMonitor = new AppActivityMonitor();
export default appActivityMonitor;
