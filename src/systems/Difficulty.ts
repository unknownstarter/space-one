import { DifficultyParams } from '../types';

export class DifficultySystem {
    // Aggressive speed ramping to ensure player cannot outrun meteors
    static getParams(timeAliveSec: number): DifficultyParams {
        let params: DifficultyParams = {
            spawnRate: 2.0, // Start with decent density
            speed: 500,     // Base speed > Player Speed (player is ~300)
            homingChance: 0,
            canSpawnFan: false
        };

        // Linear Ramp for Spawn Rate
        // Exponential-ish Ramp for Speed

        if (timeAliveSec < 20) {
            params.spawnRate = 4.0;
            params.speed = 450;
        } else if (timeAliveSec < 60) {
            params.spawnRate = 8.0;
            params.speed = 550; // Getting faster
        } else if (timeAliveSec < 120) {
            params.spawnRate = 12.0;
            params.speed = 650; // Very fast
        } else {
            // End Game / Chaos
            params.spawnRate = 20.0; // Dense rain
            params.speed = 800; // Impossible to outrun
        }

        return params;
    }
}
