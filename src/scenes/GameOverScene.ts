import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { Storage } from '../sdk/storage';
import { Ads } from '../sdk/ads';
import { COLORS } from '../types';

export class GameOverScene extends Phaser.Scene {
    private score: number = 0;
    private canContinue: boolean = true;

    constructor() {
        super('GameOverScene');
    }

    init(data: { score: number, usedContinue: boolean }) {
        this.score = data.score;
        this.canContinue = !data.usedContinue;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        // Save Score
        const isNewBest = Storage.setBestScore(this.score);
        const bestScore = Storage.getBestScore();

        // TITLE
        this.add.text(width / 2, height * 0.2, 'GAME OVER', {
            fontSize: '56px',
            color: '#' + COLORS.ACCENT_RED.toString(16),
            fontStyle: 'bold',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        // SCORE
        this.add.text(width / 2, height * 0.35, `${this.score.toFixed(1)}s`, {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        // BEST
        this.add.text(width / 2, height * 0.45, `BEST: ${bestScore.toFixed(1)}s` + (isNewBest ? ' (NEW!)' : ''), {
            fontSize: '24px',
            color: '#' + COLORS.ACCENT_YELLOW.toString(16),
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        let currentY = height * 0.6;

        // REPLAY (Big)
        new Button(this, width / 2, currentY, 'REPLAY', () => {
            this.scene.start('GameScene', { restart: true });
        });

        // CONTINUE (Ad)
        if (this.canContinue) {
            const adY = currentY + 80;

            const adContainer = this.add.container(width / 2, adY);

            const btnBg = this.add.rectangle(0, 0, 220, 50, COLORS.UI_BG).setStrokeStyle(2, COLORS.FG);
            btnBg.setInteractive({ useHandCursor: true });
            btnBg.on('pointerdown', () => this.handleContinue());

            const heart = this.add.text(-90, 0, '♥', { color: '#ff0000', fontSize: '24px' }).setOrigin(0.5);
            const txt = this.add.text(10, 0, 'REVIVE (+2s)', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

            adContainer.add([btnBg, heart, txt]);
        } else {
            this.add.text(width / 2, currentY + 80, 'NO LIVES LEFT', { color: '#666', fontSize: '16px' }).setOrigin(0.5);
        }

        // HOME (Small, Bottom)
        const homeText = this.add.text(width / 2, height - 50, 'HOME', {
            fontSize: '18px',
            color: '#888',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        homeText.on('pointerdown', () => {
            location.reload();
        });
    }

    async handleContinue() {
        const success = await Ads.showRewardedAd();
        if (success) {
            this.scene.resume('GameScene', { isContinue: true });
            this.scene.stop();
        }
    }
}
