import { CONSTANTS } from '../types';

export class CollisionSystem {
    /**
     * Simple Circle-Circle collision.
     * Player is always at screen center, so we only need enemy position relative to center?
     * Actually, if we use rendering coordinates:
     * Player is at (CX, CY), Enemy is at (EX, EY).
     */
    static checkCollision(
        playerIdx: Phaser.Math.Vector2, // or just assume center
        enemyPos: Phaser.Math.Vector2,
        enemyType: 'missile' | 'asteroid'
    ): boolean {
        const enemyRadius =
            enemyType === 'missile'
                ? CONSTANTS.MISSILE_RADIUS
                : CONSTANTS.ASTEROID_RADIUS;

        // Distance squared
        const dx = playerIdx.x - enemyPos.x;
        const dy = playerIdx.y - enemyPos.y;
        const distSq = dx * dx + dy * dy;

        const radiusSum = CONSTANTS.PLAYER_RADIUS + enemyRadius;
        return distSq < radiusSum * radiusSum;
    }
}
