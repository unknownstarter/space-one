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
            // Radius ignored by new rect logic
            this.createSingleEnemy(params, enemies, playerWorldPos);
        }
    }

    private createSingleEnemy(
        params: DifficultyParams,
        enemies: EnemyData[],
        playerWorldPos: Phaser.Math.Vector2
    ) {
        // ONLY METEORS
        const type = 'asteroid';

        // RECTANGULAR SPAWN LOGIC to solve "too far" and "uneven" issues
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        const margin = 100; // Spawn just outside screen

        const rw = w + margin * 2;
        const rh = h + margin * 2;

        // Perimeter = 2 * (rw + rh)
        // We pick a random distance along perimeter
        const perimeter = 2 * (rw + rh);
        const pVal = Math.random() * perimeter;

        let spawnX = 0;
        let spawnY = 0;

        if (pVal < rw) {
            // Top Edge
            spawnX = pVal - margin; // Shift coordinate system
            spawnY = -margin;
        } else if (pVal < rw + rh) {
            // Right Edge
            spawnX = w + margin;
            spawnY = (pVal - rw) - margin;
        } else if (pVal < rw + rh + rw) {
            // Bottom Edge
            spawnX = (rw + rh + rw - pVal) - margin; // Reverse direction
            spawnY = h + margin;
        } else {
            // Left Edge
            spawnX = -margin;
            spawnY = (perimeter - pVal) - margin; // Reverse direction
        }

        // Relative to Camera Center (which is effectively 0,0 for logic, but Scene has camera following checks)
        // Wait, playerWorldPos is absolute world coordinates.
        // We need to find the Camera View bounds in World Space.
        // The game centers the player. So Camera Center == Player World Pos.

        const spawnWorldX = playerWorldPos.x + (spawnX - w / 2);
        const spawnWorldY = playerWorldPos.y + (spawnY - h / 2);

        const worldPos = new Phaser.Math.Vector2(spawnWorldX, spawnWorldY);

        // TARGETING: Point exactly at player CURRENT position with slight randomization?
        // User asked for "more narrow targeting" if it was too far. 
        // With rectangular spawn close to player, exact targeting is fine.

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
