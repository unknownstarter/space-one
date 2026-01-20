export class AdManager {
    static init() {
        // Initial setup if needed
    }

    static showBanner() {
        const wrapper = document.getElementById('main-wrapper');
        const container = document.getElementById('top-ad-banner');
        if (!wrapper || !container) return;

        wrapper.classList.remove('in-game');
        container.style.display = 'flex';

        // Re-push if the banner was cleared or just to be safe
        try {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
        } catch (e) {
            // Ignored as it might already be loaded
        }
    }

    static hideBanner() {
        const wrapper = document.getElementById('main-wrapper');
        const container = document.getElementById('top-ad-banner');
        if (!wrapper || !container) return;

        wrapper.classList.add('in-game');
        container.style.display = 'none';
    }

    static getReviveAdHtml(slotId: string = '0987654321'): string {
        // Returns HTML for a large rectangular unit (e.g., 300x250)
        // User must replace slotId with a real one
        return `
            <div style="width: 300px; height: 250px; background: #000; overflow: hidden;">
                <ins class="adsbygoogle"
                     style="display:inline-block;width:300px;height:250px"
                     data-ad-client="ca-pub-1886599828759613"
                     data-ad-slot="${slotId}"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>
        `;
    }
}
