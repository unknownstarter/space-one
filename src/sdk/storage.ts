const KEY_BEST_SCORE = 'space_survival_best';

export const Storage = {
    getBestScore(): number {
        const val = localStorage.getItem(KEY_BEST_SCORE);
        return val ? parseFloat(val) : 0;
    },

    setBestScore(score: number) {
        const current = this.getBestScore();
        if (score > current) {
            localStorage.setItem(KEY_BEST_SCORE, score.toString());
            return true; // New record
        }
        return false;
    }
};
