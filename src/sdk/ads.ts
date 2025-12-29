export const Ads = {
    /**
     * Stub for Rewarded Ad.
     * Returns Promise<boolean>: true if watched, false if failed/closed.
     */
    async showRewardedAd(): Promise<boolean> {
        console.log('[Ads] Showing Rewarded Ad...');
        return new Promise((resolve) => {
            // Simulate ad duration
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% success rate simulation
                if (success) {
                    console.log('[Ads] Ad watched successfully.');
                    resolve(true);
                } else {
                    console.log('[Ads] Ad failed or closed early.');
                    resolve(false);
                }
            }, 2000); // 2 seconds delay
        });
    }
};
