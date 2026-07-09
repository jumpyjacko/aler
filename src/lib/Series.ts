import type { Candidate } from "./rating";

export enum SeriesStatus {
    Releasing = "Releasing",
    Completed = "Completed",
    ToBeReleased = "To be Released",
    Cancelled = "Cancelled",
    Hiatus = "Hiatus",
};

export enum UserStatus {
    Watching = "Watching",
    Reading = "Reading",
    PlanToWatch = "Plan to Watch",
    PlanToRead = "Plan to Read",
    Completed = "Completed",
    Dropped = "Dropped",
    Paused = "On-Hold",
};


export enum SeriesType {
    Anime = "ANIME",
    Manga = "MANGA",
}

export enum MediaType {
    Anime,
    Movie,
}

export interface Series extends Candidate {
    id: number, // internal storage id
    seriesType: SeriesType, 
    malId?: number,
    anilistId?: number,

    title: string,
    status?: SeriesStatus,
    score?: number,
    coverImage?: string,
    mediaType?: MediaType,

    userStatus: UserStatus,
    userScore: number,
    readChapters?: number,

    recommendedScore?: number,
}
