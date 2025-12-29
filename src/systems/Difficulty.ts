import { DifficultyParams } from '../types';

export class DifficultySystem {
    // Aggressive speed ramping to ensure player cannot outrun meteors
    static getParams(timeAliveSec: number): DifficultyParams {
        let params: DifficultyParams = {
            spawnRate: 1.5, // Start sparse
            speed: 250,     // Start manageable (Player is ~300)
            homingChance: 0,
            canSpawnFan: false
        };

        // RAMP UP
        if (timeAliveSec < 15) {
            // WARM UP
            params.spawnRate = 2.0;
            params.speed = 300;
        } else if (timeAliveSec < 45) {
            // GETTING SERIOUS
            params.spawnRate = 5.0;
            params.speed = 400;
        } else if (timeAliveSec < 90) {
            // HARD
            params.spawnRate = 8.0;
            params.speed = 550;
        } else {
            // CHAOS (Endgame)
            params.spawnRate = 12.0;
            params.speed = 700;
        }

        return params;
    }
}
