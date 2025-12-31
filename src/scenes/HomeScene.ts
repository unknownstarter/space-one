import Phaser from 'phaser';
import { COLORS } from '../types';
import { Button } from '../ui/Button';
import { TutorialPopup } from '../ui/TutorialPopup';
import { RankingPopup } from '../ui/RankingPopup';


interface BackgroundObj {
    sprite: Phaser.GameObjects.Image;
    depth: number;
    worldPos: Phaser.Math.Vector2;
}

export class HomeScene extends Phaser.Scene {
    private stars: BackgroundObj[] = [];
    private planets: BackgroundObj[] = [];
    private worldScroll: Phaser.Math.Vector2;

    private titleText!: Phaser.GameObjects.Text;
    private domElement!: Phaser.GameObjects.DOMElement;
    private startButton!: Button;
    private instructionsText!: Phaser.GameObjects.Text;

    constructor() {
        super('HomeScene');
        this.worldScroll = new Phaser.Math.Vector2(0, 0);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Background
        this.createStars();
        this.createPlanets();

        // Initial Layout
        this.createUI();

        this.scale.on('resize', this.handleResize, this);
    }

    private createUI() {
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;
        const isMobile = this.scale.width < 600;

        // Title
        // Scale font based on width relative to base 800px or use clamp
        const fontSizeVal = isMobile ? Math.max(32, this.scale.width * 0.1) : 64;

        if (this.titleText) this.titleText.destroy();
        this.titleText = this.add.text(cx, cy - (isMobile ? 120 : 200), 'Space One!', {
            fontSize: `${fontSizeVal}px`,
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#00ffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Nickname Input
        const inputWidth = isMobile ? Math.min(250, this.scale.width * 0.8) : 250;
        const inputFontSize = isMobile ? 18 : 24;

        const inputHTML = `
            <input type="text" name="nickname" placeholder="Enter Nickname" 
            style="font-size: ${inputFontSize}px; padding: 10px; width: ${inputWidth}px; text-align: center; border-radius: 8px; border: 2px solid #00ffff; background: #000; color: #fff; outline: none;">
        `;

        if (this.domElement) this.domElement.destroy();
        this.domElement = this.add.dom(cx, cy - (isMobile ? 20 : 50)).createFromHTML(inputHTML);
        this.domElement.setOrigin(0.5);

        // Start Button
        if (this.startButton) this.startButton.destroy();
        this.startButton = new Button(this, cx, cy + (isMobile ? 80 : 100), 'Game Start', () => {
            const input = this.domElement.getChildByName('nickname') as HTMLInputElement;
            const nickname = input ? input.value.trim() : 'Pilot';

            // Show Tutorial Popup instead of starting immediately
            if (this.domElement) this.domElement.setVisible(false);

            new TutorialPopup(this, () => {
                this.scene.start('GameScene', { nickname: nickname || 'Pilot' });
            });

        });

        // Ranking Button (Small, below Start)
        new Button(this, cx, cy + (isMobile ? 140 : 170), 'RANKING', () => {
            if (this.domElement) this.domElement.setVisible(false);
            new RankingPopup(this, () => {
                if (this.domElement) this.domElement.setVisible(true);
            });
        });

        // Instructions
        if (this.instructionsText) this.instructionsText.destroy();
        this.instructionsText = this.add.text(cx, this.scale.height - (isMobile ? 120 : 150), isMobile ? 'Tap / Drag to Move' : 'Use ARROW KEYS', {
            fontSize: isMobile ? '14px' : '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // FOOTER (Copyright & Links)
        const footerY = this.scale.height - 30;
        const footerStyle = { fontSize: '12px', color: '#666666' };

        const copyright = this.add.text(cx, footerY - 20, '© 2025 Dropdown', footerStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        copyright.on('pointerdown', () => window.open('https://www.dropdown.xyz/', '_blank'));

        const privacy = this.add.text(cx - 80, footerY, 'Privacy Policy', footerStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const terms = this.add.text(cx + 80, footerY, 'Terms of Service', footerStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        privacy.on('pointerdown', () => window.open('https://whatisgoingon.notion.site/Privacy-Policy-2da8cdd3705380b7b730e3ff224156cd?source=copy_link', '_blank'));
        terms.on('pointerdown', () => window.open('https://whatisgoingon.notion.site/Terms-of-Service-2da8cdd3705380dbb484d46d09ba83d9?source=copy_link', '_blank'));
    }

    update(_time: number, delta: number) {
        // Slow scroll effect (fly forward)
        const speed = 100 * (delta / 1000);
        this.worldScroll.y -= speed;

        this.updateBackground();
    }

    private updateBackground() {
        const h = this.scale.height;

        const updateObj = (obj: BackgroundObj) => {
            obj.worldPos.y += 0.5 * obj.depth;

            const rangeH = h * 1.5;
            if (obj.worldPos.y > rangeH / 2) obj.worldPos.y -= rangeH;

            obj.sprite.y = (this.scale.height / 2) + obj.worldPos.y;
            obj.sprite.x = (this.scale.width / 2) + obj.worldPos.x;
        };

        this.stars.forEach(updateObj);
        this.planets.forEach(updateObj);
    }

    private createStars() {
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            const isBig = Math.random() < 0.3;
            const star = this.add.image(0, 0, 'star');
            const depth = Phaser.Math.FloatBetween(0.2, 0.5);
            star.setAlpha(depth + 0.3);
            star.setScale(isBig ? 2 : 1);

            const rangeX = this.scale.width * 1.5;
            const rangeY = this.scale.height * 1.5;

            this.stars.push({
                sprite: star,
                depth,
                worldPos: new Phaser.Math.Vector2(
                    Phaser.Math.FloatBetween(-rangeX / 2, rangeX / 2),
                    Phaser.Math.FloatBetween(-rangeY / 2, rangeY / 2)
                )
            });
        }
    }

    private createPlanets() {
        this.planets = [];
        const types = ['planet_ice', 'planet_lava', 'planet_moon'];
        for (let i = 0; i < 2; i++) {
            const type = Phaser.Utils.Array.GetRandom(types);
            const planet = this.add.image(0, 0, type);
            const depth = Phaser.Math.FloatBetween(0.05, 0.1);
            planet.setAlpha(0.6);
            planet.setScale(0.8);

            const rangeX = this.scale.width;
            const rangeY = this.scale.height;

            this.planets.push({
                sprite: planet,
                depth,
                worldPos: new Phaser.Math.Vector2(
                    Phaser.Math.FloatBetween(-rangeX / 2, rangeX / 2),
                    Phaser.Math.FloatBetween(-rangeY / 2, rangeY / 2)
                )
            });
        }
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
        this.createUI(); // Re-create UI on resize for responsive layout
    }
}
