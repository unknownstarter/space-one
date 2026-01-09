export class AdManager {
    static init() {
        // Initial setup if needed
    }

    // static showBanner(slotId: string = '1234567890') {
    //     const container = document.getElementById('ad-banner-bottom');
    //     if (!container) return;

    //     // Clear previous ads
    //     container.innerHTML = '';
    //     container.style.display = 'block';
    //     container.style.pointerEvents = 'auto'; // Enable clicks

    //     // Create Ad Unit
    //     const ins = document.createElement('ins');
    //     ins.className = 'adsbygoogle';
    //     ins.style.display = 'inline-block';
    //     ins.style.width = '320px';
    //     ins.style.height = '50px';
    //     ins.setAttribute('data-ad-client', 'ca-pub-1886599828759613');
    //     ins.setAttribute('data-ad-slot', slotId);

    //     container.appendChild(ins);

    //     // Push to AdSense
    //     try {
    //         (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    //         (window as any).adsbygoogle.push({});
    //     } catch (e) {
    //         console.error('AdSense push failed', e);
    //     }
    // }

    // static hideBanner() {
    //     const container = document.getElementById('ad-banner-bottom');
    //     if (container) {
    //         container.style.display = 'none';
    //         container.innerHTML = ''; // Prevent background Refresh
    //     }
    // }

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
