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
            // Just enough to learn controls
            params.spawnRate = 2.0;
            params.speed = 300;
        } else if (timeAliveSec < 30) {
            // RAMP UP (10-30s)
            // Noticeable jump
            params.spawnRate = 4.0;
            params.speed = 450;
        } else if (timeAliveSec < 60) {
            // HARD (30-60s)
            // Very fast
            params.spawnRate = 7.0;
            params.speed = 600;
        } else {
            // CHAOS (>60s)
            // Survival mode
            params.spawnRate = 10.0 + (timeAliveSec - 60) * 0.1; // Slowly increase rate forever
            params.speed = 750;
        }

        return params;
    }
}
