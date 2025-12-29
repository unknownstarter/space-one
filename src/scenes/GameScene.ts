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

    private timeAlive: number = 0;
    private isGameOver: boolean = false;
    private usedContinue: boolean = false;

    private player!: Phaser.GameObjects.Image;
    private enemyGroup!: Phaser.GameObjects.Group;

    private gameLayer!: Phaser.GameObjects.Container; // New: Moves with World
    private explosions!: Phaser.GameObjects.Particles.ParticleEmitter;
    private cometTrails!: Phaser.GameObjects.Particles.ParticleEmitter;

    private stars: Star[] = [];
    private planets: Planet[] = [];

    private hud!: HUD;
    private spawner!: Spawner;
    private invincibilityTimer: number = 0;
    private slowMoTimer: number = 0;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super('GameScene');
        this.playerWorldPos = new Phaser.Math.Vector2(0, 0);
        this.worldOffset = new Phaser.Math.Vector2(0, 0);
    }

    create(data: { restart: boolean, nickname?: string }) {
        console.log('GameScene: create', data.nickname);
        this.cameras.main.setBackgroundColor(COLORS.BG);

        this.timeAlive = 0;
        this.isGameOver = false;
        this.usedContinue = false;
        this.enemies = [];
        this.invincibilityTimer = 0;
        this.slowMoTimer = 0;
        this.playerWorldPos.set(0, 0);

        // Background (Stars/Planets - Parallax managed manually)
        this.createStars();
        this.createPlanets();

        // Game Layer (Enemies, Particles)
        this.gameLayer = this.add.container(0, 0);

        // Trails (Added to Layer)
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

        // Player (Fixed Center - OUTSIDE GameLayer)
        this.player = this.add.image(0, 0, 'ship');
        this.player.setDepth(10);

        // Explosions (Added to Layer)
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

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // Support up to 2 pointers for multi-touch (prevents locking)
        this.input.addPointer(1);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isGameOver) return;
            if (!pointer.isDown) return;

            // Sensitivity 2.0 makes it feel "snappier" on mobile
            const sensitivity = 2.0;

            // Use local delta if possible or calculate manually
            const dx = (pointer.x - pointer.prevPosition.x) * sensitivity;
            const dy = (pointer.y - pointer.prevPosition.y) * sensitivity;

            // Prevent small jitters?
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

            this.movePlayer(dx, dy);
        });

        this.scale.on('resize', this.handleResize, this);
        this.events.on('resume', this.handleResume, this);
    }

    private movePlayer(dx: number, dy: number) {
        this.playerWorldPos.x += dx;
        this.playerWorldPos.y += dy;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            const angle = Math.atan2(dy, dx);
            this.player.setRotation(angle + Math.PI / 2);
        }
    }

    private handleResume(_scene: Phaser.Scene, data: { isContinue: boolean }) {
        if (data && data.isContinue) {
            this.isGameOver = false;
            this.usedContinue = true;
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
            // Emit at WorldPos (Container handles offset)
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

        for (let i = 0; i < 4; i++) {
            const type = Phaser.Utils.Array.GetRandom(types);
            const planet = this.add.image(0, 0, type);
            const depth = Phaser.Math.FloatBetween(0.05, 0.1);
            planet.setAlpha(0.8);
            planet.setDepth(1);

            const range = 4000;
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

        if (this.cursors) {
            const speed = 300 * (delta / 1000);
            let dx = 0;
            let dy = 0;
            if (this.cursors.left.isDown) dx -= speed;
            if (this.cursors.right.isDown) dx += speed;
            if (this.cursors.up.isDown) dy -= speed;
            if (this.cursors.down.isDown) dy += speed;
            if (dx !== 0 || dy !== 0) {
                this.movePlayer(dx, dy);
            }
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
                // PURE WORLD POSITION (Container handles offset)
                enemy.sprite.setPosition(enemy.worldPos.x, enemy.worldPos.y);

                if (enemy.type === 'missile') {
                    enemy.sprite.setRotation(enemy.baseVelocity.angle() + Math.PI / 2);
                } else {
                    enemy.sprite.setRotation(enemy.sprite.rotation + 0.05);
                }

                // Emit Comet Trail (At WorldPos)
                if (enemy.type === 'asteroid' || enemy.type === 'missile') {
                    this.cometTrails.emitParticleAt(enemy.worldPos.x, enemy.worldPos.y, 1);
                }
            }
        });

        const w = this.scale.width;
        const h = this.scale.height;

        const updateBackgroundObj = (obj: { worldPos: Phaser.Math.Vector2, depth: number, sprite: Phaser.GameObjects.Image }) => {
            const rangeW = w * 2.5;
            const rangeH = h * 2.5;

            let dx = obj.worldPos.x - this.playerWorldPos.x;
            let dy = obj.worldPos.y - this.playerWorldPos.y;

            if (dx < -rangeW / 2) obj.worldPos.x += rangeW;
            if (dx > rangeW / 2) obj.worldPos.x -= rangeW;
            if (dy < -rangeH / 2) obj.worldPos.y += rangeH;
            if (dy > rangeH / 2) obj.worldPos.y -= rangeH;

            const cx = obj.worldPos.x + this.worldOffset.x * obj.depth;
            const cy = obj.worldPos.y + this.worldOffset.y * obj.depth;

            obj.sprite.setPosition(cx, cy);
        };

        this.stars.forEach(updateBackgroundObj);
        this.planets.forEach(updateBackgroundObj);
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
            usedContinue: this.usedContinue
        });
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        if (this.hud) {
            this.hud.resize(gameSize.width);
        }
    }
}
