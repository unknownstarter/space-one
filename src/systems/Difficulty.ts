import { DifficultyParams } from '../types';

export class DifficultySystem {
    // Aggressive speed ramping to ensure player cannot outrun meteors
    static getParams(timeAliveSec: number): DifficultyParams {
        // Tuned based on feedback: "Needs to get harder faster"
        let params: DifficultyParams = {
            spawnRate: 1.5,
            speed: 250,
            homingChance: 0,
            canSpawnFan: false
        };

        if (timeAliveSec < 10) {
            // WARM UP (0-10s)
            // Gentle start, learning controls
            params.spawnRate = 1.0; // Reduced from 2.0
            params.speed = 220; // Reduced from 300
        } else if (timeAliveSec < 25) {
            // LOW INTENSITY (10-25s)
            // Gradual increase
            params.spawnRate = 2.5; // Was 4.0 at 10s
            params.speed = 350; // Was 450
        } else if (timeAliveSec < 50) {
            // RAMP UP (25-50s)
            // Getting serious
            params.spawnRate = 5.0;
            params.speed = 500;
        } else {
            // CHAOS (>50s)
            // Survival mode
            params.spawnRate = 8.0 + (timeAliveSec - 50) * 0.2;
            params.speed = 700;
        }

        return params;
    }
}
