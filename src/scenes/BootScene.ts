import Phaser from 'phaser';
import { COLORS } from '../types';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log('BootScene: preload started');

        this.createShipTexture();
        this.createMissileTexture();
        this.createAsteroidTexture();
        this.createStarTexture();
        this.createParticleTexture();
        this.createPlanetTextures(); // New
        this.load.image('tutorial_joystick', 'assets/tutorial_joystick.png');

        console.log('BootScene: textures generated');
    }

    createShipTexture() {
        // "Micro Recon" Inspired Ship - Fixed
        const graphics = this.make.graphics({ x: 0, y: 0 });
        const p = 2;

        // Palette
        const cDark = 0x222222;
        const cRed = 0xAA0000;
        const cGrey = 0x666666;
        const cEng = 0x00FFFF;

        const draw = (x: number, y: number, color: number) => {
            graphics.fillStyle(color);
            graphics.fillRect(x * p, y * p, 1 * p, 1 * p);
        };

        // Body (Main Fuselage)
        graphics.fillStyle(cDark);
        graphics.fillRect(7 * p, 2 * p, 2 * p, 10 * p); // Central spine
        graphics.fillRect(6 * p, 4 * p, 4 * p, 6 * p);  // Core block

        // Cockpit / Nose
        graphics.fillStyle(cGrey);
        graphics.fillRect(7 * p, 3 * p, 2 * p, 2 * p);

        // Wings (Swept forward/boxy)
        graphics.fillStyle(cRed);
        graphics.fillRect(3 * p, 6 * p, 3 * p, 4 * p);
        graphics.fillRect(2 * p, 5 * p, 1 * p, 4 * p);
        graphics.fillRect(10 * p, 6 * p, 3 * p, 4 * p);
        graphics.fillRect(13 * p, 5 * p, 1 * p, 4 * p);

        // Detail / Highlights
        draw(3, 7, cGrey);
        draw(12, 7, cGrey);

        // Engines (Rear)
        graphics.fillStyle(cEng);
        graphics.fillRect(6 * p, 12 * p, 1 * p, 2 * p);
        graphics.fillRect(9 * p, 12 * p, 1 * p, 2 * p);

        // Engine Glow/Trail hints
        graphics.fillStyle(0x00AAAA);
        graphics.fillRect(6 * p, 14 * p, 1 * p, 1 * p);
        graphics.fillRect(9 * p, 14 * p, 1 * p, 1 * p);

        graphics.generateTexture('ship', 16 * p, 16 * p);
    }

    createPlanetTextures() {
        // Create 3 planet variations
        this.createPlanet('planet_ice', 0x4488ff, 0xaaddff, 0x0044aa);
        this.createPlanet('planet_lava', 0xff4422, 0xffaa00, 0x660000);
        this.createPlanet('planet_moon', 0x888888, 0xbbbbbb, 0x444444);
    }

    createPlanet(key: string, baseColor: number, lightColor: number, darkColor: number) {
        const size = 128; // Texture size
        const p = 4; // Pixel size for "chunky" look
        const graphics = this.make.graphics({ x: 0, y: 0 });

        const cx = size / 2;
        const cy = size / 2;
        const radius = (size / 2) - 4;

        // We will iterate pixels directly? No, graphics calls are better.
        // Draw Base Circle
        graphics.fillStyle(baseColor);
        graphics.fillCircle(cx, cy, radius);

        // Draw details using random rects masked by circle?
        // Simple approach: layers of noise.

        // Shadow (Crescent)
        graphics.fillStyle(0x000000, 0.4);
        graphics.beginPath();
        graphics.arc(cx, cy, radius, 0.5, 3.5); // Bottom-Right shadow
        graphics.fill();

        // Patches (Simulate continents/craters)
        // Use randomness to place "blobs"
        for (let i = 0; i < 40; i++) {
            const px = Phaser.Math.Between(0, size);
            const py = Phaser.Math.Between(0, size);
            const pr = Phaser.Math.Between(p * 2, p * 6);

            // Check if inside circle
            const d = Phaser.Math.Distance.Between(cx, cy, px, py);
            if (d + pr < radius) {
                const isLight = Math.random() > 0.5;
                graphics.fillStyle(isLight ? lightColor : darkColor);
                // Draw "pixelated" circle (square or cross)
                graphics.fillRect(px, py, pr, pr);
                graphics.fillRect(px - p, py + p, pr + p * 2, pr - p * 2);
            }
        }

        // Highlight (Top Left)
        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillCircle(cx - radius / 3, cy - radius / 3, radius / 4);

        graphics.generateTexture(key, size, size);
    }

    createMissileTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        const p = 2;

        // Red/Orange missile
        graphics.fillStyle(COLORS.ACCENT_RED);
        graphics.fillRect(1 * p, 0 * p, 2 * p, 8 * p);

        graphics.fillStyle(COLORS.FG);
        graphics.fillRect(1 * p, 0 * p, 2 * p, 2 * p);

        graphics.fillStyle(COLORS.FG_DARK);
        graphics.fillRect(0 * p, 6 * p, 1 * p, 2 * p);
        graphics.fillRect(3 * p, 6 * p, 1 * p, 2 * p);

        graphics.generateTexture('missile', 4 * p, 10 * p);
    }

    createAsteroidTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        const p = 4;

        graphics.fillStyle(COLORS.FG_DARK);
        graphics.fillRect(1 * p, 0 * p, 4 * p, 6 * p);
        graphics.fillRect(0 * p, 1 * p, 6 * p, 4 * p);

        graphics.fillStyle(0x555555);
        graphics.fillRect(1 * p, 1 * p, 4 * p, 4 * p);

        graphics.fillStyle(0x333333);
        graphics.fillRect(2 * p, 2 * p, 1 * p, 1 * p);
        graphics.fillRect(3 * p, 3 * p, 1 * p, 1 * p);

        graphics.generateTexture('asteroid', 6 * p, 6 * p);
    }

    createStarTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(COLORS.FG, 1.0);
        graphics.fillRect(0, 0, 2, 2);
        graphics.generateTexture('star', 2, 2);
    }

    createParticleTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(COLORS.FG, 1.0);
        graphics.fillRect(0, 0, 4, 4);
        graphics.generateTexture('particle', 4, 4);
    }

    create() {
        console.log('BootScene: create - starting HomeScene');
        this.scene.start('HomeScene');
    }
}
