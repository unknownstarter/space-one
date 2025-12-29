import Phaser from 'phaser';
import { COLORS } from '../types';
import { Button } from '../ui/Button';

interface BackgroundObj {
    sprite: Phaser.GameObjects.Image;
    depth: number;
    worldPos: Phaser.Math.Vector2;
}

export class HomeScene extends Phaser.Scene {
    private stars: BackgroundObj[] = [];
    private planets: BackgroundObj[] = [];
    private worldScroll: Phaser.Math.Vector2;

    constructor() {
        super('HomeScene');
        this.worldScroll = new Phaser.Math.Vector2(0, 0);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Background
        this.createStars();
        this.createPlanets();

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        // Title
        this.add.text(cx, cy - 200, 'Space One!', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#00ffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Nickname Input
        // Note: Check if DOM is enabled in game config
        const inputHTML = `
            <input type="text" name="nickname" placeholder="Enter Nickname" 
            style="font-size: 24px; padding: 10px; width: 250px; text-align: center; border-radius: 8px; border: 2px solid #00ffff; background: #000; color: #fff; outline: none;">
        `;

        const domElement = this.add.dom(cx, cy - 50).createFromHTML(inputHTML);
        domElement.setOrigin(0.5);

        // Start Button
        new Button(this, cx, cy + 100, 'Game Start', () => {
            const input = domElement.getChildByName('nickname') as HTMLInputElement;
            const nickname = input ? input.value.trim() : 'Pilot';
            this.scene.start('GameScene', { nickname: nickname || 'Pilot' });
        });

        // Instructions
        this.add.text(cx, this.scale.height - 50, 'Use ARROW KEYS to Move', {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.scale.on('resize', this.handleResize, this);
    }

    update(_time: number, delta: number) {
        // Slow scroll effect (fly forward)
        const speed = 100 * (delta / 1000);
        this.worldScroll.y -= speed;

        this.updateBackground();
    }

    private updateBackground() {
        // Simulate camera moving UP (so objects move DOWN)
        const h = this.scale.height;

        const updateObj = (obj: BackgroundObj) => {
            // Apply simple scroll based on depth
            // We'll mimic "moving forward" by creating a radial expansion or just vertical scroll?
            // Let's do simple vertical scroll for Home screen
            obj.worldPos.y += 0.5 * obj.depth; // Move down slowly

            // Wrap logic
            const rangeH = h * 1.5;
            if (obj.worldPos.y > rangeH / 2) obj.worldPos.y -= rangeH;

            // Convert "World" to "Screen" (Center origin)
            // Just map directly for home screen
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
        // Could re-center UI elements here if needed, but for now simple refresh is okay
    }
}
