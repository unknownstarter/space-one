import Phaser from 'phaser';
import { EnemyData, CONSTANTS, COLORS } from '../types';
import { DifficultySystem } from '../systems/Difficulty';
import { Spawner } from '../systems/Spawner';
import { CollisionSystem } from '../systems/Collision';
import { HUD } from '../ui/HUD';
import { Storage } from '../sdk/storage';

interface Star {
    sprite: Phaser.GameObjects.Image;
    depth: number;
    worldPos: Phaser.Math.Vector2;
}

interface Planet {
    sprite: Phaser.GameObjects.Image;
    depth: number;
    worldPos: Phaser.Math.Vector2;
}

export class GameScene extends Phaser.Scene {
    private playerWorldPos: Phaser.Math.Vector2;
    private worldOffset: Phaser.Math.Vector2;
    private enemies: EnemyData[] = [];
    private nickname: string = 'Pilot';
    private sessionId: string = '';

    private timeAlive: number = 0;
    private isGameOver: boolean = false;
    private reviveCount: number = 0;

    private player!: Phaser.GameObjects.Image;
    private enemyGroup!: Phaser.GameObjects.Group;

    private gameLayer!: Phaser.GameObjects.Container;
    private explosions!: Phaser.GameObjects.Particles.ParticleEmitter;
    private cometTrails!: Phaser.GameObjects.Particles.ParticleEmitter;

    private stars: Star[] = [];
    private planets: Planet[] = [];

    private hud!: HUD;
    private spawner!: Spawner;
    private invincibilityTimer: number = 0;
    private slowMoTimer: number = 0;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    // Joystick State
    private isDragging: boolean = false;
    private touchOrigin: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private touchCurrent: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private joystickBase!: Phaser.GameObjects.Arc;
    private joystickStick!: Phaser.GameObjects.Arc;
    private targetVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();


    constructor() {
        super('GameScene');
        this.playerWorldPos = new Phaser.Math.Vector2(0, 0);
        this.worldOffset = new Phaser.Math.Vector2(0, 0);
    }

    create(data: { restart: boolean, nickname?: string }) {
        console.log('GameScene: create', data.nickname);
        if (data.nickname) this.nickname = data.nickname;
        this.cameras.main.setBackgroundColor(COLORS.BG);

        this.timeAlive = 0;
        this.isGameOver = false;
        this.reviveCount = 0;
        this.enemies = [];
        // Generate a simple unique session ID (timestamp + random) or reuse existing if just restarting? 
        // Actually, if restarting, it's a NEW game, so new ID.
        // If resuming (Revive), we keep the same ID (this method isn't called on resume).
        this.sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        this.invincibilityTimer = 0;
        this.slowMoTimer = 0;
        this.playerWorldPos.set(0, 0);

        // Background
        this.createStars();
        this.createPlanets();

        // Game Layer
        this.gameLayer = this.add.container(0, 0);

        // Trails
        this.cometTrails = this.add.particles(0, 0, 'particle', {
            lifespan: 500,
            speed: { min: 10, max: 20 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [0xffaa00, 0xff4400, 0xaaaaaa],
            blendMode: 'ADD',
            emitting: false
        });
        this.gameLayer.add(this.cometTrails);

        // Player
        this.player = this.add.image(0, 0, 'ship');
        this.player.setDepth(10);

        // Explosions
        this.explosions = this.add.particles(0, 0, 'particle', {
            lifespan: 500,
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });
        this.gameLayer.add(this.explosions);

        this.enemyGroup = this.add.group();

        const best = Storage.getBestScore();
        const nickname = data.nickname || 'Pilot';
        this.hud = new HUD(this, best, nickname);
        this.hud.setDepth(100);

        this.spawner = new Spawner(this);

        // Joystick Visuals (Floating)
        this.joystickBase = this.add.circle(0, 0, 50, 0xffffff, 0.1).setDepth(200).setVisible(false);
        this.joystickStick = this.add.circle(0, 0, 20, 0xffffff, 0.5).setDepth(200).setVisible(false);

        this.setupInput();

        this.scale.on('resize', this.handleResize, this);
        this.events.on('resume', this.handleResume, this);
    }

    private setupInput() {
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        this.input.addPointer(1); // Multitouch support

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isGameOver) return;

            this.isDragging = true;
            this.touchOrigin.set(pointer.x, pointer.y);
            this.touchCurrent.set(pointer.x, pointer.y);
            this.updateJoystickVisuals();
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.isDragging) return;
            if (!pointer.isDown) { // Safety check
                this.isDragging = false;
                this.joystickBase.setVisible(false);
                this.joystickStick.setVisible(false);
                this.targetVelocity.set(0, 0);
                return;
            }

            this.touchCurrent.set(pointer.x, pointer.y);
            this.updateJoystickVisuals();
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
            this.joystickBase.setVisible(false);
            this.joystickStick.setVisible(false);
            this.targetVelocity.set(0, 0);
        });
    }

    private updateJoystickVisuals() {
        // Calculate Vector
        const maxDist = 50;
        const vec = this.touchCurrent.clone().subtract(this.touchOrigin);
        const dist = vec.length();

        // Visualize
        this.joystickBase.setPosition(this.touchOrigin.x, this.touchOrigin.y);
        this.joystickBase.setVisible(true);

        const clampedDist = Math.min(dist, maxDist);
        const angle = vec.angle();

        const stickX = this.touchOrigin.x + Math.cos(angle) * clampedDist;
        const stickY = this.touchOrigin.y + Math.sin(angle) * clampedDist;

        this.joystickStick.setPosition(stickX, stickY);
        this.joystickStick.setVisible(true);

        // Set Control Velocity (0-1 range) based on distance? 
        // Or just normalized direction if passed a threshold?
        // "Natural" usually means proportional speed up to max.

        if (dist > 5) {
            const power = Math.min(dist / maxDist, 1.0);
            this.targetVelocity.set(Math.cos(angle), Math.sin(angle)).scale(power);
        } else {
            this.targetVelocity.set(0, 0);
        }
    }

    private handleResume(_scene: Phaser.Scene, data: { isContinue: boolean }) {
        if (data && data.isContinue) {
            this.isGameOver = false;
            this.reviveCount++;
            this.invincibilityTimer = CONSTANTS.INVINCIBLE_TIME;
            this.slowMoTimer = CONSTANTS.SLOW_TIME;

            this.clearNearbyEnemies();

            const txt = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'INVINCIBLE', {
                fontSize: '32px', color: '#ffff00', fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0);

            this.tweens.add({
                targets: txt,
                alpha: 0,
                duration: 1000,
                onComplete: () => txt.destroy()
            });
        }
    }

    private clearNearbyEnemies() {
        const safeRadius = 400;
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            const dist = e.worldPos.distance(this.playerWorldPos);
            if (dist < safeRadius) {
                this.killEnemy(e, i, false);
            }
        }
    }

    private killEnemy(e: EnemyData, index: number, explode: boolean) {
        if (e.sprite) e.sprite.destroy();

        if (explode) {
            this.explosions.emitParticleAt(e.worldPos.x, e.worldPos.y, 10);
        }

        this.enemies.splice(index, 1);
    }

    private createStars() {
        this.stars = [];
        for (let i = 0; i < 80; i++) {
            const isBig = Math.random() < 0.3;
            const star = this.add.image(0, 0, 'star');
            const depth = Phaser.Math.FloatBetween(0.2, 0.4);
            star.setAlpha(depth + 0.3);
            star.setScale(isBig ? 2 : 1);
            star.setDepth(0);

            const range = 1500;
            const wx = Phaser.Math.FloatBetween(-range, range);
            const wy = Phaser.Math.FloatBetween(-range, range);

            this.stars.push({
                sprite: star,
                depth,
                worldPos: new Phaser.Math.Vector2(wx, wy)
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
            planet.setAlpha(0.8);
            planet.setDepth(1);

            const range = 8000;
            const wx = Phaser.Math.FloatBetween(-range, range);
            const wy = Phaser.Math.FloatBetween(-range, range);

            this.planets.push({
                sprite: planet,
                depth,
                worldPos: new Phaser.Math.Vector2(wx, wy)
            });
        }
    }

    update(time: number, delta: number) {
        if (this.isGameOver && !this.scene.isPaused('GameScene')) {
            return;
        }

        // PLAYER MOVEMENT LOGIC
        let dx = 0;
        let dy = 0;
        const playerSpeed = 300; // Pixels per second

        // Keyboard (Priority?)
        if (this.cursors) {
            if (this.cursors.left.isDown) dx -= 1;
            if (this.cursors.right.isDown) dx += 1;
            if (this.cursors.up.isDown) dy -= 1;
            if (this.cursors.down.isDown) dy += 1;
        }

        // Joystick (Override if active)
        if (this.isDragging) {
            dx = this.targetVelocity.x;
            dy = this.targetVelocity.y;
        }

        // Apply Movement
        if (dx !== 0 || dy !== 0) {
            // Normalize if Keyboard
            if (!this.isDragging && (dx !== 0 || dy !== 0)) {
                const mag = Math.sqrt(dx * dx + dy * dy);
                dx /= mag;
                dy /= mag;
            }

            const moveDist = playerSpeed * (delta / 1000);
            this.playerWorldPos.x += dx * moveDist;
            this.playerWorldPos.y += dy * moveDist;

            // Rotation
            const angle = Math.atan2(dy, dx);
            this.player.setRotation(angle + Math.PI / 2);
        }

        this.invincibilityTimer = Math.max(0, this.invincibilityTimer - delta);
        this.slowMoTimer = Math.max(0, this.slowMoTimer - delta);

        this.timeAlive += delta / 1000;
        this.hud.updateTime(this.timeAlive);

        // Update World Offset
        this.worldOffset.x = (this.scale.width / 2) - this.playerWorldPos.x;
        this.worldOffset.y = (this.scale.height / 2) - this.playerWorldPos.y;

        // MOVE GAME LAYER
        this.gameLayer.setPosition(this.worldOffset.x, this.worldOffset.y);

        // Difficulty
        const diffParams = DifficultySystem.getParams(this.timeAlive);
        const speedMultiplier = (this.slowMoTimer > 0) ? CONSTANTS.SLOW_FACTOR : 1.0;
        const currentParams = { ...diffParams, speed: diffParams.speed * speedMultiplier };

        this.spawner.update(delta, currentParams, this.enemies, this.playerWorldPos);

        this.updateEnemies(delta, currentParams);
        this.updateRendering();

        if (this.invincibilityTimer <= 0) {
            this.checkCollisions();
        }

        if (this.invincibilityTimer > 0) {
            this.player.setAlpha(Math.sin(time / 50) * 0.5 + 0.5);
        } else {
            this.player.setAlpha(1);
        }

        this.player.setPosition(this.scale.width / 2, this.scale.height / 2);
    }

    private updateEnemies(delta: number, params: { speed: number, homingChance: number }) {
        for (const enemy of this.enemies) {
            if (enemy.homing) {
                const desiredDir = new Phaser.Math.Vector2(
                    this.playerWorldPos.x - enemy.worldPos.x,
                    this.playerWorldPos.y - enemy.worldPos.y
                ).normalize();

                const currentDir = enemy.baseVelocity.clone().normalize();
                const turnRate = 0.1;
                const newDir = currentDir.lerp(desiredDir, turnRate).normalize();

                enemy.baseVelocity = newDir.scale(params.speed);
            } else {
                enemy.baseVelocity.setLength(params.speed);
            }

            const dx = enemy.baseVelocity.x * (delta / 1000);
            const dy = enemy.baseVelocity.y * (delta / 1000);

            enemy.worldPos.x += dx;
            enemy.worldPos.y += dy;
        }

        const cleanupDist = 2000;
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].worldPos.distance(this.playerWorldPos) > cleanupDist) {
                this.killEnemy(this.enemies[i], i, false);
            }
        }
    }

    private updateRendering() {
        this.enemies.forEach((enemy) => {
            if (!enemy.sprite) {
                const sprite = this.enemyGroup.get(0, 0, enemy.type);
                if (sprite) {
                    sprite.setVisible(true);
                    sprite.setActive(true);
                    // Ensure added to Layer
                    this.gameLayer.add(sprite);
                    enemy.sprite = sprite;
                } else {
                    const s = this.add.image(0, 0, enemy.type);
                    this.gameLayer.add(s); // Add to Layer
                    enemy.sprite = s;
                }
            }

            if (enemy.sprite) {
                enemy.sprite.setPosition(enemy.worldPos.x, enemy.worldPos.y);

                if (enemy.type === 'missile') {
                    enemy.sprite.setRotation(enemy.baseVelocity.angle() + Math.PI / 2);
                } else {
                    enemy.sprite.setRotation(enemy.sprite.rotation + 0.05);
                }

                if (enemy.type === 'asteroid' || enemy.type === 'missile') {
                    this.cometTrails.emitParticleAt(enemy.worldPos.x, enemy.worldPos.y, 1);
                }
            }
        });

        const w = this.scale.width;
        const h = this.scale.height;

        // Stars wrap infinitely
        const updateStar = (obj: { worldPos: Phaser.Math.Vector2, depth: number, sprite: Phaser.GameObjects.Image }) => {
            const rangeW = w * 2.5;
            const rangeH = h * 2.5;

            let dx = obj.worldPos.x - this.playerWorldPos.x;
            let dy = obj.worldPos.y - this.playerWorldPos.y;

            if (dx < -rangeW / 2) obj.worldPos.x += rangeW;
            if (dx > rangeW / 2) obj.worldPos.x -= rangeW;
            if (dy < -rangeH / 2) obj.worldPos.y += rangeH;
            if (dy > rangeH / 2) obj.worldPos.y -= rangeH;

            const offsetX = (obj.worldPos.x - this.playerWorldPos.x) * obj.depth;
            const offsetY = (obj.worldPos.y - this.playerWorldPos.y) * obj.depth;

            const cx = (w / 2) + offsetX;
            const cy = (h / 2) + offsetY;

            obj.sprite.setPosition(cx, cy);
        };

        // Planets have fixed world positions - only show when in range
        const updatePlanet = (obj: { worldPos: Phaser.Math.Vector2, depth: number, sprite: Phaser.GameObjects.Image }) => {
            const offsetX = (obj.worldPos.x - this.playerWorldPos.x) * obj.depth;
            const offsetY = (obj.worldPos.y - this.playerWorldPos.y) * obj.depth;

            const cx = (w / 2) + offsetX;
            const cy = (h / 2) + offsetY;

            // Only show if within reasonable screen bounds
            const margin = 500;
            const isVisible = cx > -margin && cx < w + margin && cy > -margin && cy < h + margin;

            obj.sprite.setVisible(isVisible);
            obj.sprite.setPosition(cx, cy);
        };

        this.stars.forEach(updateStar);
        this.planets.forEach(updatePlanet);
    }

    private checkCollisions() {
        const pPos = this.playerWorldPos;

        for (const enemy of this.enemies) {
            if (CollisionSystem.checkCollision(pPos, enemy.worldPos, enemy.type)) {
                this.onHit();
                break;
            }
        }
    }

    private onHit() {
        this.cameras.main.shake(100, 0.01);

        this.tweens.add({
            targets: this.player,
            alpha: 0,
            yoyo: true,
            duration: 50,
            repeat: 3
        });

        this.gameOver();
    }

    private gameOver() {
        this.isGameOver = true;
        this.scene.pause();
        this.scene.launch('GameOverScene', {
            score: this.timeAlive,
            reviveCount: this.reviveCount,
            nickname: this.nickname,
            sessionId: this.sessionId
        });

        // Cleanup Input
        this.isDragging = false;
        this.joystickBase.setVisible(false);
        this.joystickStick.setVisible(false);
        this.targetVelocity.set(0, 0);
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        if (this.hud) {
            this.hud.resize(gameSize.width);
        }
    }
}
