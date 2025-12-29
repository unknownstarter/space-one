import Phaser from 'phaser';
import { COLORS } from '../types';

export class HUD extends Phaser.GameObjects.Container {
    private nameText: Phaser.GameObjects.Text;
    private scoreLabel: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private bestText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, bestScore: number, nickname: string) {
        super(scene, 0, 0);

        const width = scene.scale.width;
        const p = 20;

        // CENTER: Current Time (Big)
        this.scoreLabel = scene.add.text(width / 2, 40, '0.0', {
            fontFamily: 'monospace',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        this.scoreLabel.setColor('#' + COLORS.FG.toString(16));

        // LEFT: Nickname + TIME Label
        this.nameText = scene.add.text(p, p, nickname.toUpperCase(), {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#00ffff'
        }).setScrollFactor(0);

        this.timeText = scene.add.text(p, p + 30, 'TIME', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#666666'
        }).setScrollFactor(0);

        // RIGHT: BEST Label + Score
        this.bestText = scene.add.text(width - p, p, `BEST ${bestScore.toFixed(1)}`, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#' + COLORS.ACCENT_YELLOW.toString(16)
        }).setOrigin(1, 0).setScrollFactor(0);

        this.add([this.scoreLabel, this.timeText, this.bestText, this.nameText]);
        scene.add.existing(this);
    }

    updateTime(timeAlive: number) {
        this.scoreLabel.setText(timeAlive.toFixed(1));
    }

    resize(width: number) {
        const p = 20;
        this.scoreLabel.setX(width / 2);
        this.bestText.setPosition(width - p, p);
    }
}
