import Phaser from 'phaser';
import { Button } from './Button';
import { AdManager } from '../sdk/AdManager';

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
        // Dynamic height to fit small screens + footer space
        const safeHeight = height - 100; // Leave space for footer
        const targetH = Math.min(600, safeHeight);

        const popupW = Math.min(width * 0.9, 360);
        const popupH = targetH;

        const bg = scene.add.rectangle(width / 2, height / 2, popupW, popupH, 0x222222).setStrokeStyle(2, 0x00ffff);
        this.add(bg);

        // Adjust offsets based on dynamic height
        const halfH = popupH / 2;

        // 3. Title - Top area
        const titleY = -halfH + 40;
        const title = scene.add.text(width / 2, height / 2 + titleY, 'WATCH AD TO REVIVE', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(title);

        // 4. Ad Container (DOM) - Center area
        // We define available space for Ad
        // Top is titleY (~40px), Bottom is Button area (~80px) + Info (~30px)
        // Ad should take remaining space?
        // Let's just center it but shift up slightly.
        const adY = -20;
        // User must put RECTANGULAR slot ID here
        const adHTML = AdManager.getReviveAdHtml('5878909333');

        this.domElement = scene.add.dom(width / 2, height / 2 + adY).createFromHTML(adHTML);
        this.domElement.setOrigin(0.5);

        // Scale DOM element if it doesn't fit?
        // Hard to scale native DOM easily. We assume ad unit fits (300x250 usually).
        // If popup is smaller than 300x250 space, we have an issue.
        // 600px height is fine. If height < 400, ad might overlap.

        this.add(this.domElement);

        // 5. Instruction Text
        const infoY = halfH - 90;
        const info = scene.add.text(width / 2, height / 2 + infoY, 'Watch the ad to continue...', {
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        this.add(info);

        // 6. Confirm / Reward Button
        const btnY = halfH - 40;
        const btn = new Button(scene, width / 2, height / 2 + btnY, 'GET REWARD', () => {
            this.destroy(); // Destroy self
            onClose(); // Callback
        });
        this.add(btn);
    }

    destroy(fromScene?: boolean) {
        if (this.domElement) this.domElement.destroy();
        super.destroy(fromScene);
    }
}
