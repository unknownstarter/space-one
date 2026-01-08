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
        // We insert a large ad unit here via AdManager
        // User must put RECTANGULAR slot ID here
        const adHTML = AdManager.getReviveAdHtml('5878909333');

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
        const btn = new Button(scene, width / 2, height / 2 + 200, 'GET REWARD', () => {
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
