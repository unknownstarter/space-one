import { DifficultyParams } from '../types';

export class DifficultySystem {
    // Aggressive speed ramping to ensure player cannot outrun meteors
    static getParams(timeAliveSec: number): DifficultyParams {
        const baseSpeed = 200;
        const speedIncrementPerSec = 10;
        const maxSpeed = 800;

        const baseSpawnRate = 3.0; // Increased base from 1.5/2.5 for more meteors
        const spawnRateIncrementPer10Sec = 2.0;

        // Linear speed increase (approx. every 1 second)
        let speed = baseSpeed + (timeAliveSec * speedIncrementPerSec);
        if (speed > maxSpeed) speed = maxSpeed;

        // Step-wise spawn rate increase (every 10 seconds)
        let spawnRate = baseSpawnRate + (Math.floor(timeAliveSec / 10) * spawnRateIncrementPer10Sec);

        // Add additional chaos scaling after 30 seconds
        if (timeAliveSec > 30) {
            spawnRate += (timeAliveSec - 30) * 0.2;
        }

        return {
            spawnRate: spawnRate,
            speed: speed,
            homingChance: 0,
            canSpawnFan: timeAliveSec > 20
        };
    }
}
