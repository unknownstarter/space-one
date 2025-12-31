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
    private rankingButton!: Button;
    private instructionsText!: Phaser.GameObjects.Text;

    // Footer Links
    private copyright!: Phaser.GameObjects.Text;
    private privacy!: Phaser.GameObjects.Text;
    private terms!: Phaser.GameObjects.Text;

    constructor() {
        super('HomeScene');
        this.worldScroll = new Phaser.Math.Vector2(0, 0);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Background
        this.createStars();
        this.createPlanets();

        // One-time UI Creation
        this.createUIElements();

        // Correctly position them
        this.handleResize(this.scale.gameSize);

        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', this.cleanup, this);
    }

    private cleanup() {
        this.scale.off('resize', this.handleResize, this);
    }

    private createUIElements() {
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        // 1. Title
        this.titleText = this.add.text(cx, cy, 'Space One!', {
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#00ffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 2. Nickname Input
        const inputHTML = `
            <input type="text" name="nickname" placeholder="Enter Nickname" 
            style="font-size: 24px; padding: 10px; width: 250px; text-align: center; border-radius: 8px; border: 2px solid #00ffff; background: #000; color: #fff; outline: none;">
        `;
        this.domElement = this.add.dom(cx, cy).createFromHTML(inputHTML);
        this.domElement.setOrigin(0.5);

        // 3. Start Button
        this.startButton = new Button(this, cx, cy, 'Game Start', () => {
            const input = this.domElement.getChildByName('nickname') as HTMLInputElement;
            const nickname = input ? input.value.trim() : 'Pilot';

            if (this.domElement) this.domElement.setVisible(false);
            new TutorialPopup(this, () => {
                this.scene.start('GameScene', { nickname: nickname || 'Pilot' });
            });
        });

        // 4. Ranking Button
        this.rankingButton = new Button(this, cx, cy, 'RANKING', () => {
            if (this.domElement) this.domElement.setVisible(false);
            new RankingPopup(this, () => {
                if (this.domElement) this.domElement.setVisible(true);
            });
        });

        // 5. Instructions
        this.instructionsText = this.add.text(cx, cy, '', {
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // 6. Footer
        const footerStyle = { fontSize: '12px', color: '#666666' };

        this.copyright = this.add.text(cx, 0, '© 2025 Dropdown', footerStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        this.copyright.on('pointerdown', () => window.open('https://www.dropdown.xyz/', '_blank'));

        this.privacy = this.add.text(cx, 0, 'Privacy Policy', footerStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        this.privacy.on('pointerdown', () => window.open('https://whatisgoingon.notion.site/Privacy-Policy-2da8cdd3705380b7b730e3ff224156cd?source=copy_link', '_blank'));

        this.terms = this.add.text(cx, 0, 'Terms of Service', footerStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        this.terms.on('pointerdown', () => window.open('https://whatisgoingon.notion.site/Terms-of-Service-2da8cdd3705380dbb484d46d09ba83d9?source=copy_link', '_blank'));
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);

        const cx = gameSize.width / 2;
        const cy = gameSize.height / 2;
        const isMobile = gameSize.width < 600;

        // Title
        const fontSizeVal = isMobile ? Math.max(32, gameSize.width * 0.1) : 64;
        this.titleText.setFontSize(fontSizeVal);
        this.titleText.setPosition(cx, cy - (isMobile ? 120 : 200));

        // Input
        this.domElement.setPosition(cx, cy - (isMobile ? 20 : 50));
        const input = this.domElement.getChildByName('nickname') as HTMLInputElement;
        if (input) {
            const inputWidth = isMobile ? Math.min(250, gameSize.width * 0.8) : 250;
            const inputFontSize = isMobile ? '18px' : '24px';
            input.style.width = `${inputWidth}px`;
            input.style.fontSize = inputFontSize;
        }

        // Buttons
        this.startButton.setPosition(cx, cy + (isMobile ? 80 : 100));
        this.rankingButton.setPosition(cx, cy + (isMobile ? 140 : 170));

        // Instructions
        this.instructionsText.setText(isMobile ? 'Tap / Drag to Move' : 'Use ARROW KEYS');
        this.instructionsText.setFontSize(isMobile ? 14 : 18);
        this.instructionsText.setPosition(cx, gameSize.height - (isMobile ? 120 : 150));

        // Footer
        const footerY = gameSize.height - 30;
        this.copyright.setPosition(cx, footerY - 20);
        this.privacy.setPosition(cx - 80, footerY);
        this.terms.setPosition(cx + 80, footerY);
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

            // Simple wrapping logic might differ from create logic slightly, 
            // but the keys are consistent.

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
}
