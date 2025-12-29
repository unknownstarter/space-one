import Phaser from 'phaser';

export class Button extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, label: string, callback: () => void) {
        super(scene, x, y);

        const width = 200;
        const height = 50;

        this.bg = scene.add.rectangle(0, 0, width, height, 0x333333);
        this.bg.setStrokeStyle(2, 0xffffff);
        this.bg.setInteractive({ useHandCursor: true });

        this.text = scene.add.text(0, 0, label, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add([this.bg, this.text]);

        this.bg.on('pointerdown', () => {
            this.bg.setFillStyle(0x555555);
        });

        this.bg.on('pointerup', () => {
            this.bg.setFillStyle(0x333333);
            callback();
        });

        this.bg.on('pointerout', () => {
            this.bg.setFillStyle(0x333333);
        });

        scene.add.existing(this);
    }

    setDisabled(disabled: boolean) {
        if (disabled) {
            this.bg.disableInteractive();
            this.bg.setAlpha(0.5);
            this.text.setAlpha(0.5);
        } else {
            this.bg.setInteractive({ useHandCursor: true });
            this.bg.setAlpha(1);
            this.text.setAlpha(1);
        }
    }
}
