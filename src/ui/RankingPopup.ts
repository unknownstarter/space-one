import Phaser from 'phaser';
import { Button } from './Button';
import { FirebaseAPI } from '../sdk/firebase';
import { COLORS } from '../types';

export class RankingPopup extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, onClose: () => void) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.setDepth(2000); // Higher than RevivePopup

        const width = scene.scale.width;
        const height = scene.scale.height;

        // 1. Dark Overlay
        const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        overlay.setInteractive();
        this.add(overlay);

        // 2. Popup Body
        const popupW = Math.min(width * 0.9, 400);
        const popupH = 600;
        const bg = scene.add.rectangle(width / 2, height / 2, popupW, popupH, 0x222222).setStrokeStyle(2, COLORS.ACCENT_YELLOW);
        this.add(bg);

        // 3. Title
        const title = scene.add.text(width / 2, height / 2 - 250, 'TOP 10 PILOTS', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.add(title);

        // 4. Loading Text
        const loadingText = scene.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '18px',
            color: '#aaaaaa',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.add(loadingText);

        // 5. Close Button
        const closeBtn = new Button(scene, width / 2, height / 2 + 230, 'CLOSE', () => {
            this.destroy();
            onClose();
        });
        this.add(closeBtn);

        // 6. Fetch Data
        this.fetchAndDisplay(scene, loadingText, width / 2, height / 2 - 200);
    }

    async fetchAndDisplay(scene: Phaser.Scene, loadingText: Phaser.GameObjects.Text, startX: number, startY: number) {
        const scores = await FirebaseAPI.getTopScores(10);

        if (!this.scene) return; // Scene might have changed

        loadingText.destroy();

        if (scores.length === 0) {
            this.add(scene.add.text(startX, startY + 100, 'No records yet.', {
                fontSize: '16px', color: '#666'
            }).setOrigin(0.5));
            return;
        }

        scores.forEach((entry, index) => {
            const y = startY + (index * 40);

            // Rank
            const rankTxt = scene.add.text(startX - 150, y, `#${index + 1}`, {
                fontSize: '20px', color: index < 3 ? '#ffcc00' : '#ffffff', fontFamily: 'monospace'
            }).setOrigin(0, 0.5);

            // Name
            const nameTxt = scene.add.text(startX - 80, y, entry.nickname, {
                fontSize: '20px', color: '#ffffff', fontFamily: 'monospace'
            }).setOrigin(0, 0.5);

            // Score
            const scoreTxt = scene.add.text(startX + 150, y, `${entry.score.toFixed(1)}s`, {
                fontSize: '20px', color: '#00ffff', fontFamily: 'monospace'
            }).setOrigin(1, 0.5);

            this.add([rankTxt, nameTxt, scoreTxt]);
        });
    }
}
