import Phaser from 'phaser';
import { Button } from './Button';

export class TutorialPopup extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    private panel: Phaser.GameObjects.Rectangle;
    private titleText: Phaser.GameObjects.Text;
    private instructionTextKorean: Phaser.GameObjects.Text;
    private instructionTextEnglish: Phaser.GameObjects.Text;
    private tutorialImage: Phaser.GameObjects.Image;
    private startButton: Button;

    constructor(scene: Phaser.Scene, onStart: () => void) {
        super(scene, 0, 0);

        const width = scene.scale.width;
        const height = scene.scale.height;
        const cx = width / 2;
        const cy = height / 2;

        // Dark Overlay
        this.bg = scene.add.rectangle(cx, cy, width, height, 0x000000, 0.7);
        this.bg.setInteractive(); // Block clicks below

        // Popup Panel
        const panelW = Math.min(600, width * 0.9);
        const panelH = Math.min(800, height * 0.9);
        this.panel = scene.add.rectangle(cx, cy, panelW, panelH, 0x111111);
        this.panel.setStrokeStyle(4, 0x00ffff);

        // Title
        this.titleText = scene.add.text(cx, cy - panelH * 0.42, 'HOW TO PLAY', {
            fontSize: '32px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instructions
        const textStyle = {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: panelW * 0.8 }
        };

        this.instructionTextKorean = scene.add.text(cx, cy - panelH * 0.32,
            '탭하고 있는 상태에서 원하는 방향으로 유성을 피하세요!',
            textStyle
        ).setOrigin(0.5);

        this.instructionTextEnglish = scene.add.text(cx, cy - panelH * 0.25,
            'Tap and hold to move the joystick and dodge meteors!',
            { ...textStyle, color: '#aaaaaa', fontSize: '16px' }
        ).setOrigin(0.5);

        // Image
        this.tutorialImage = scene.add.image(cx, cy + panelH * 0.05, 'tutorial_joystick');

        // Scale image to fit within panel
        const maxImgW = panelW * 0.8;
        const maxImgH = panelH * 0.35;
        const updateScale = () => {
            const scale = Math.min(maxImgW / this.tutorialImage.width, maxImgH / this.tutorialImage.height);
            this.tutorialImage.setScale(scale);
        };
        // If image is already loaded (it should be), scale it. otherwise wait.
        if (this.tutorialImage.width > 0) {
            updateScale();
        }

        // Start Button
        this.startButton = new Button(scene, cx, cy + panelH * 0.38, 'Start Game', () => {
            this.destroy(); // Remove popup
            onStart(); // Trigger game start
        });

        this.add([
            this.bg,
            this.panel,
            this.titleText,
            this.instructionTextKorean,
            this.instructionTextEnglish,
            this.tutorialImage,
            this.startButton
        ]);

        this.setDepth(1000); // Ensure on top
        scene.add.existing(this);

        // Fade in animation
        this.setAlpha(0);
        scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 300
        });
    }
}
