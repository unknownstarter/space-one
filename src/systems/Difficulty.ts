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
            // PHASE 1 (0-10s)
            // Dense spawn but slow speed (Learning to dodge)
            params.spawnRate = 2.5;
            params.speed = 200;
        } else if (timeAliveSec < 20) {
            // PHASE 2 (10-20s)
            // More meteors, slightly faster
            params.spawnRate = 4.0;
            params.speed = 250;
        } else if (timeAliveSec < 30) {
            // PHASE 3 (20-30s)
            // Ramp up speed
            params.spawnRate = 6.0;
            params.speed = 350;
        } else {
            // CHAOS (>30s)
            // Survival mode
            params.spawnRate = 8.0 + (timeAliveSec - 30) * 0.2;
            // Cap speed
            let s = 600 + (timeAliveSec - 30) * 5;
            if (s > 800) s = 800;
            params.speed = s;
        }

        return params;
    }
}
