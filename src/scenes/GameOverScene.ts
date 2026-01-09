import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { Storage } from '../sdk/storage';
import { COLORS } from '../types';
import { RevivePopup } from '../ui/RevivePopup';
import { FirebaseAPI } from '../sdk/firebase';
import { RankingPopup } from '../ui/RankingPopup';
// import { AdManager } from '../sdk/AdManager';

export class GameOverScene extends Phaser.Scene {
    private score: number = 0;
    private canContinue: boolean = true;

    constructor() {
        super('GameOverScene');
    }

    private nickname: string = 'Pilot';
    private sessionId: string = '';

    init(data: { score: number, reviveCount: number, nickname: string, sessionId: string }) {
        this.score = data.score;
        this.canContinue = data.reviveCount < 5;
        if (data.nickname) this.nickname = data.nickname;
        if (data.sessionId) this.sessionId = data.sessionId;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        // Save Score (Local)
        const isNewBest = Storage.setBestScore(this.score);
        const bestScore = Storage.getBestScore();

        // Save Score (Cloud)
        const sid = this.sessionId || Date.now().toString(); // Fallback
        FirebaseAPI.saveScore(this.nickname, this.score, sid);

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
            // AdManager.hideBanner();
            this.scene.start('GameScene', { restart: true });
        });

        // RANKING (Small)
        new Button(this, width / 2, currentY + 160, 'RANKING', () => {
            new RankingPopup(this, () => { });
        });

        // CONTINUE (Ad)
        if (this.canContinue) {
            const adY = currentY + 80;

            const adContainer = this.add.container(width / 2, adY);

            const btnBg = this.add.rectangle(0, 0, 220, 50, COLORS.UI_BG).setStrokeStyle(2, COLORS.FG);
            btnBg.setInteractive({ useHandCursor: true });
            btnBg.on('pointerdown', () => this.handleContinue());

            const heart = this.add.text(-90, 0, '♥', { color: '#ff0000', fontSize: '24px' }).setOrigin(0.5);
            const txt = this.add.text(10, 0, `REVIVE (+2s)`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

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
            // Hide Ad before leaving
            // AdManager.hideBanner();
            location.reload();
        });

        // SHOW AD Banner (Safe because we have content on this screen)
        // User needs to put real slot ID here
        // AdManager.showBanner('3614039774');
    }

    async handleContinue() {
        // Open the Revive Popup with Ad
        new RevivePopup(this, () => {
            // Callback when "Reward" is clicked
            // AdManager.hideBanner();
            this.scene.resume('GameScene', { isContinue: true });
            this.scene.stop();
        });
    }
}
