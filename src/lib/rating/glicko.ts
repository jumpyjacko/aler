import type { Candidate, MatchOutcome, RatingSystem } from ".";

const q: number = Math.log(10) / 400;

export class Glicko implements RatingSystem {
    private minRatingDeviation: number;

    constructor(minRd: number = 30) {
        this.minRatingDeviation = minRd;
    }

    update(p1: Candidate, p2: Candidate, outcome: MatchOutcome): [Candidate, Candidate] {
        const g_rd2 = g(p2.ratingDeviation);
        const e1 = E(g_rd2, p1.mmrRating, p2.mmrRating);
        const dSquared1 = 1 / (q * q * g_rd2 * g_rd2 * e1 * (1 - e1));

        const newRd1 = 1 / Math.sqrt((1 / (p1.ratingDeviation * p1.ratingDeviation)) + (1 / dSquared1));
        const newR1 = p1.mmrRating + (q / ((1 / (p1.ratingDeviation * p1.ratingDeviation)) + (1 / dSquared1))) * g_rd2 * (outcome - e1);

        const g_rd1 = g(p1.ratingDeviation);
        const e2 = E(g_rd1, p2.mmrRating, p1.mmrRating);
        const dSquared2 = 1 / (q * q * g_rd1 * g_rd1 * e2 * (1 - e2));

        const newRd2 = 1 / Math.sqrt((1 / (p2.ratingDeviation * p2.ratingDeviation)) + (1 / dSquared2));
        const newR2 = p2.mmrRating + (q / ((1 / (p2.ratingDeviation * p2.ratingDeviation)) + (1 / dSquared2))) * g_rd1 * ((1 - outcome) - e2);

        p1.mmrRating = Math.round(newR1 * 100) / 100;
        p1.ratingDeviation = Math.max(this.minRatingDeviation, Math.round(newRd1 * 100) / 100);
        p2.mmrRating = Math.round(newR2 * 100) / 100;
        p2.ratingDeviation = Math.max(this.minRatingDeviation, Math.round(newRd2 * 100) / 100);

        return [p1, p2];
    }
}

function g(rd_i: number): number {
    return 1 / (Math.sqrt(1 + ((3 * (q * q) * (rd_i * rd_i)) / (Math.PI * Math.PI))));
}

function E(g_rd_i: number, r_i: number, r_j: number): number {
    return 1 / (1 + Math.pow(10, (g_rd_i * (r_i - r_j)) / -400));
}
