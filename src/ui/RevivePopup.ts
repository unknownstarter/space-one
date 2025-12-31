import Phaser from 'phaser';
import { Button } from './Button';

export class RevivePopup extends Phaser.GameObjects.Container {
    private domElement: Phaser.GameObjects.DOMElement;

    constructor(scene: Phaser.Scene, onClose: () => void) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.setDepth(1000); // High depth to cover everything

        const width = scene.scale.width;
        const height = scene.scale.height;

        // 1. Dark Overlay
        const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        overlay.setInteractive(); // Block clicks below
        this.add(overlay);

        // 2. Popup Body
        const popupW = Math.min(width * 0.9, 360);
        const popupH = 600;
        const bg = scene.add.rectangle(width / 2, height / 2, popupW, popupH, 0x222222).setStrokeStyle(2, 0x00ffff);
        this.add(bg);

        // 3. Title
        const title = scene.add.text(width / 2, height / 2 - 250, 'WATCH AD TO REVIVE', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(title);

        // 4. Ad Container (DOM)
        // We insert a responsive ad unit here
        const adWidth = 300;
        const adHeight = 250;

        // Note: In a real scenario, you'd paste your AdSense code into the innerHTML
        // For compliance, we use a placeholder styling that looks like an ad slot
        const adHTML = `
            <div style="width: ${adWidth}px; height: ${adHeight}px; background-color: #eee; display: flex; align-items: center; justify-content: center; color: #333; font-family: sans-serif; font-size: 14px; border: 1px solid #ccc;">
                <div style="text-align: center;">
                    <p style="margin: 0; font-weight: bold;">AdSense Block</p>
                    <p style="font-size: 10px; margin-top: 5px;">(Ad will appear here)</p>
                     <!-- Paste actual AdSense <ins> tag here eventually -->
                </div>
            </div>
        `;

        this.domElement = scene.add.dom(width / 2, height / 2 - 50).createFromHTML(adHTML);
        this.domElement.setOrigin(0.5);
        this.add(this.domElement);

        // 5. Instruction Text
        const info = scene.add.text(width / 2, height / 2 + 100, 'Watch the ad to continue...', {
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        this.add(info);

        // 6. Confirm / Reward Button
        // Simulating the "Reward Granted" event or manual user confirmation
        new Button(scene, width / 2, height / 2 + 200, 'GET REWARD', () => {
            this.destroy(); // Destroy self
            onClose(); // Callback
        });
    }

    destroy(fromScene?: boolean) {
        if (this.domElement) this.domElement.destroy();
        super.destroy(fromScene);
    }
}
