declare global {
    interface Window {
        gtag: (command: string, ...args: any[]) => void;
        dataLayer: any[];
    }
}

export const Analytics = {
    logEvent(eventName: string, params: Record<string, any> = {}) {
        if (typeof window.gtag !== 'function') {
            console.warn('Analytics: gtag not initialized');
            return;
        }

        // Debug log for development verification
        console.log(`[Analytics] Logging event: ${eventName}`, params);

        window.gtag('event', eventName, params);
    }
};
