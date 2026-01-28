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
        // On mobile, the height is often the constraint. 
        const isSmallHeight = height < 600;
        const popupW = Math.min(width * 0.9, 400);
        const popupH = Math.min(height * 0.85, 600);

        const bg = scene.add.rectangle(width / 2, height / 2, popupW, popupH, 0x222222).setStrokeStyle(2, COLORS.ACCENT_YELLOW);
        this.add(bg);

        // 3. Title
        const titleY = height / 2 - (popupH / 2) + (isSmallHeight ? 35 : 50);
        const title = scene.add.text(width / 2, titleY, 'TOP 10 PILOTS', {
            fontSize: isSmallHeight ? '24px' : '32px',
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

        // 5. Close Button - Positioned at bottom of popup
        const closeBtnY = height / 2 + (popupH / 2) - (isSmallHeight ? 40 : 60);
        const closeBtn = new Button(scene, width / 2, closeBtnY, 'CLOSE', () => {
            this.destroy();
            onClose();
        });
        this.add(closeBtn);

        // 6. Fetch Data - Adjust startY based on dynamic height
        const listStartY = titleY + (isSmallHeight ? 40 : 60);
        this.fetchAndDisplay(scene, loadingText, width / 2, listStartY, isSmallHeight);
    }

    async fetchAndDisplay(scene: Phaser.Scene, loadingText: Phaser.GameObjects.Text, startX: number, startY: number, isSmall: boolean) {
        const scores = await FirebaseAPI.getTopScores(10);

        if (!this.scene) return; // Scene might have changed

        loadingText.destroy();

        if (scores.length === 0) {
            this.add(scene.add.text(startX, startY + 50, 'No records yet.', {
                fontSize: '16px', color: '#666'
            }).setOrigin(0.5));
            return;
        }

        const itemGap = isSmall ? 32 : 40;
        const fontSize = isSmall ? '16px' : '20px';

        scores.forEach((entry, index) => {
            const y = startY + (index * itemGap);

            // Rank
            const rankTxt = scene.add.text(startX - 150, y, `#${index + 1}`, {
                fontSize: fontSize, color: index < 3 ? '#ffcc00' : '#ffffff', fontFamily: 'monospace'
            }).setOrigin(0, 0.5);

            // Name
            const nameTxt = scene.add.text(startX - 80, y, entry.nickname, {
                fontSize: fontSize, color: '#ffffff', fontFamily: 'monospace'
            }).setOrigin(0, 0.5);

            // Score
            const scoreTxt = scene.add.text(startX + 150, y, `${entry.score.toFixed(1)}s`, {
                fontSize: fontSize, color: '#00ffff', fontFamily: 'monospace'
            }).setOrigin(1, 0.5);

            this.add([rankTxt, nameTxt, scoreTxt]);
        });
    }
}
