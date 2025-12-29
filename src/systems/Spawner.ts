import Phaser from 'phaser';
import { EnemyData, DifficultyParams, CONSTANTS } from '../types';

export class Spawner {
    private scene: Phaser.Scene;
    private spawnTimer: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    update(
        delta: number,
        params: DifficultyParams,
        enemies: EnemyData[],
        playerWorldPos: Phaser.Math.Vector2
    ) {
        const interval = 1000 / params.spawnRate;

        this.spawnTimer += delta;
        if (this.spawnTimer >= interval) {
            this.spawnTimer -= interval;
            this.spawnEnemy(params, enemies, playerWorldPos);
        }
    }

    private spawnEnemy(
        params: DifficultyParams,
        enemies: EnemyData[],
        playerWorldPos: Phaser.Math.Vector2
    ) {
        // Tighter Spawn Radius for faster action
        // Use Max Dimension / 2 + Small Margin
        const margin = 50;
        const radiusBase = Math.max(this.scene.scale.width, this.scene.scale.height) / 2;
        const spawnRadius = radiusBase + margin;

        const isFan = params.canSpawnFan && Math.random() < CONSTANTS.FAN_SHOT_CHANCE;

        if (isFan) {
            this.spawnFan(params, enemies, playerWorldPos, spawnRadius);
        } else {
            this.createSingleEnemy(params, enemies, playerWorldPos, spawnRadius);
        }
    }

    private createSingleEnemy(
        params: DifficultyParams,
        enemies: EnemyData[],
        playerWorldPos: Phaser.Math.Vector2,
        radius: number,
        angleOverride?: number
    ) {
        // ONLY METEORS
        const type = 'asteroid';

        const angle = angleOverride ?? Phaser.Math.FloatBetween(0, Math.PI * 2);

        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        const worldPos = new Phaser.Math.Vector2(
            playerWorldPos.x + offsetX,
            playerWorldPos.y + offsetY
        );

        // TARGETING: Point exactly at player CURRENT position
        const dirX = playerWorldPos.x - worldPos.x;
        const dirY = playerWorldPos.y - worldPos.y;

        // Normalize
        const mag = Math.sqrt(dirX * dirX + dirY * dirY);
        const normX = dirX / mag;
        const normY = dirY / mag;

        const velocity = new Phaser.Math.Vector2(
            normX * params.speed,
            normY * params.speed
        );

        if (type === 'asteroid') {
            // Slight speed variance is fine, but DIRECTION must be exact.
            // Keeping speed variance small to avoid "slow ones" lingering
            const speedVar = Phaser.Math.FloatBetween(0.9, 1.1);
            velocity.scale(speedVar);
        }

        const enemy: EnemyData = {
            type,
            baseVelocity: velocity,
            worldPos,
            homing: false,
            spawnTime: this.scene.time.now
        };

        enemies.push(enemy);
    }

    private spawnFan(
        params: DifficultyParams,
        enemies: EnemyData[],
        playerWorldPos: Phaser.Math.Vector2,
        radius: number
    ) {
        const baseAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const spread = 0.2; // radians

        for (let i = -1; i <= 1; i++) {
            const angle = baseAngle + (i * spread);
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            const worldPos = new Phaser.Math.Vector2(
                playerWorldPos.x + offsetX,
                playerWorldPos.y + offsetY
            );

            const dirX = playerWorldPos.x - worldPos.x;
            const dirY = playerWorldPos.y - worldPos.y;
            const mag = Math.sqrt(dirX * dirX + dirY * dirY);

            const velocity = new Phaser.Math.Vector2(
                (dirX / mag) * params.speed,
                (dirY / mag) * params.speed
            );

            enemies.push({
                type: 'missile',
                baseVelocity: velocity,
                worldPos,
                homing: false
            });
        }
    }
}
