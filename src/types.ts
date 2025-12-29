export interface DifficultyParams {
    spawnRate: number; // Enemies per second
    speed: number; // Pixel per second
    homingChance: number; // 0.0 to 1.0
    canSpawnFan: boolean; // 3-way shot
}

export type EnemyType = 'missile' | 'asteroid';

export interface EnemyData {
    type: EnemyType;
    baseVelocity: Phaser.Math.Vector2;
    worldPos: Phaser.Math.Vector2;
    homing: boolean;
    sprite?: Phaser.GameObjects.Image;
    // Debug
    debugLine?: Phaser.GameObjects.Graphics;
    spawnTime?: number;
}

export const CONSTANTS = {
    PLAYER_RADIUS: 12,
    MISSILE_RADIUS: 10,
    ASTEROID_RADIUS: 14,
    INVINCIBLE_TIME: 2000,
    SLOW_TIME: 500,
    SLOW_FACTOR: 0.7,
    FAN_SHOT_CHANCE: 0.1,
    // Debug
    DEBUG_LINE_DURATION: 300,
};

// Start Palette
// bg: #14121A
// fg: #EDEDED
// accentRed: #FF3B3B
// accentYellow: #FFC94A
export const COLORS = {
    BG: 0x14121A,
    FG: 0xEDEDED,
    FG_DARK: 0x999999, // Outline?
    ACCENT_RED: 0xFF3B3B,
    ACCENT_YELLOW: 0xFFC94A,
    UI_BG: 0x222222,
};
