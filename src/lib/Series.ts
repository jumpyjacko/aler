import type { Candidate } from "./rating";

export enum SeriesStatus {
    Releasing = "Releasing",
    Completed = "Completed",
    ToBeReleased = "To be Released",
    Cancelled = "Cancelled",
    Hiatus = "Hiatus",
};

export enum UserStatus { // TODO: consider generalising for other media?
    Watching = "Watching",
    Reading = "Reading",
    PlanToWatch = "Plan to Watch",
    PlanToRead = "Plan to Read",
    Completed = "Completed",
    Dropped = "Dropped",
    Paused = "On-Hold",
};


export interface Series extends Candidate {
    id: number, // internal storage id
    malId?: number,
    anilistId?: number,

    title: string,
    status?: SeriesStatus,
    rating?: number,
    coverImage?: string,

    userStatus: UserStatus,
    userRating: number,
    readChapters?: number,
}
