import type { Series } from "$lib/Series";

export enum MatchOutcome {
    win = 1.0,
    loss = 0.0,
    draw = 0.5,
}

export interface Candidate {
    mmrRating: number,
    ratingDeviation: number,
    volatility?: number,
}

export interface RatingSystem {
    update(s1: Series, s2: Series, outcome: MatchOutcome): void;
}
