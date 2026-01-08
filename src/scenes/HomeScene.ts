import Phaser from 'phaser';
import { COLORS } from '../types';
import { Button } from '../ui/Button';
import { TutorialPopup } from '../ui/TutorialPopup';
import { RankingPopup } from '../ui/RankingPopup';
import { AdManager } from '../sdk/AdManager';

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

        // 7. Lore / Tips Section (Policy Compliance Content)
        this.createLoreSection(cx);

        // 8. Enable Banner (Now safe due to Lore content)
        AdManager.showBanner('3614039774');
    }

    private createLoreSection(cx: number) {
        const tips = [
            "TIP: Moving continuously makes you harder to hit.",
            "LORE: The sector 7G quarantine has been lifted... for now.",
            "TIP: Red missiles track your heat signature. Sharp turns help.",
            "LORE: You are piloting the last MK-IV Interceptor.",
            "TIP: Collect hearts to repair hull damage instantly."
        ];
        const randomTip = Phaser.Utils.Array.GetRandom(tips);

        const tipBox = this.add.container(cx, this.scale.height - 100);

        // Background for text visibility
        const bg = this.add.rectangle(0, 0, 400, 40, 0x000000, 0.6).setStrokeStyle(1, 0x00ffff);
        bg.setName('bg'); // Allow access in resize

        const text = this.add.text(0, 0, randomTip, {
            fontSize: '14px',
            color: '#00ffff',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5);
        text.setName('text'); // Allow access in resize

        tipBox.add([bg, text]);

        // Assign to a class property if we need to resize it later, 
        // but for now just adding it to the scene is enough.
        // We'll give it a name to find it in resize if needed.
        tipBox.setName('loreBox');
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);

        const cx = gameSize.width / 2;
        const cy = gameSize.height / 2;
        const h = gameSize.height;
        const isMobile = gameSize.width < 600 || gameSize.height < 700;
        const isVerySmallHeight = gameSize.height < 600;

        // Title
        const titleY = isVerySmallHeight ? h * 0.15 : cy - 200;
        const fontSizeVal = isMobile ? Math.max(32, gameSize.width * 0.1) : 64;
        this.titleText.setFontSize(fontSizeVal);
        this.titleText.setPosition(cx, titleY);

        // Center Group (Input, Buttons)
        let centerGroupY = cy;
        if (isVerySmallHeight) {
            centerGroupY = h * 0.45;
        }

        // Input
        const inputY = centerGroupY - (isMobile ? 20 : 50);
        this.domElement.setPosition(cx, inputY);
        const input = this.domElement.getChildByName('nickname') as HTMLInputElement;
        if (input) {
            const inputWidth = isMobile ? Math.min(250, gameSize.width * 0.8) : 250;
            const inputFontSize = isMobile ? '18px' : '24px';
            input.style.width = `${inputWidth}px`;
            input.style.fontSize = inputFontSize;
        }

        // Buttons
        const startBtnY = inputY + (isMobile ? 60 : 80);
        this.startButton.setPosition(cx, startBtnY);

        const rankBtnY = startBtnY + (isMobile ? 60 : 70);
        this.rankingButton.setPosition(cx, rankBtnY);

        // Layout Strategy for Bottom Elements:
        // 1. Text Instructions (Move closer to buttons)
        // 2. Lore Box (Above footer)
        // 3. Footer (Bottom)

        // Instructions - Position below Ranking Button
        let instructionsY = rankBtnY + 40;
        this.instructionsText.setText(isMobile ? 'Tap / Drag to Move' : 'Use ARROW KEYS');
        this.instructionsText.setFontSize(isMobile ? 14 : 18);
        this.instructionsText.setPosition(cx, instructionsY);

        // Footer - Always at bottom
        const footerY = h - 30;
        this.copyright.setPosition(cx, footerY - 20);
        this.privacy.setPosition(cx - 80, footerY);
        this.terms.setPosition(cx + 80, footerY); // Spread out more?
        // Let's adjust footer spread on mobile vs desktop?
        // Current: -80 and +80. If width is small, might overlap?
        // 80px * 2 = 160px width. Mobile is 320px+. Should be fine.

        // Lore Box Position
        // Must be ABOVE footer, but BELOW instructions.
        const loreBox = this.children.getByName('loreBox') as Phaser.GameObjects.Container;
        if (loreBox) {
            // Target Y: Above footer with padding
            const targetLoreY = footerY - 80;

            // Check collision with instructions
            // Instructions are at `instructionsY`. Text height ~20px.
            // If `targetLoreY` is too close to `instructionsY + 20`, we have an issue.
            // Let's ensure at least 30px gap.
            const minLoreY = instructionsY + 40;

            let finalLoreY = targetLoreY;
            if (targetLoreY < minLoreY) {
                // If we are crunched, we need to prioritize.
                // 1. Lore Box is mandatory (AdSense).
                // 2. Instructions are nice to have.
                // If it's REALLY tight, hide instructions.
                if (h < 550) { // Extremely short screen
                    this.instructionsText.setVisible(false);
                    // Move Lore box up slightly if allowed, or keep target.
                } else {
                    // Try to fit both by pushing Lore Box down? No, footer is there.
                    // Maybe move Instructions UP? They are already tight to buttons.
                    // Let's hide instructions if we overlap significantly.
                    if (targetLoreY < instructionsY + 20) {
                        this.instructionsText.setVisible(false);
                    } else {
                        this.instructionsText.setVisible(true);
                    }
                }
            } else {
                this.instructionsText.setVisible(true);
            }

            loreBox.setPosition(cx, finalLoreY);

            const bg = loreBox.getByName('bg') as Phaser.GameObjects.Rectangle;
            const text = loreBox.getByName('text') as Phaser.GameObjects.Text;

            // Responsive Width & Height
            const boxWidth = Math.min(400, gameSize.width * 0.9);
            // Dynamic height based on wrapped text? 
            // Hard to calculate exact wrapped height in Phaser easily without pre-calc.
            // But we can estimate. 60px is usually enough for 2 lines.
            const boxHeight = isMobile ? 60 : 40;

            if (bg) {
                bg.setSize(boxWidth, boxHeight);
            }
            if (text) {
                text.setWordWrapWidth(boxWidth - 20);
            }
        }
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
