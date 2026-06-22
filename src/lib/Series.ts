export enum SeriesStatus { // TODO: consider generalising for other media?
    Airing = "Airing",
    Completed = "Completed",
    ToBeReleased = "To be Released",
    Cancelled = "Cancelled",
    Hiatus = "Hiatus",
};

export enum UserStatus { // TODO: consider generalising for other media?
    Watching = "Watching",
    PlanToWatch = "Plan to Watch",
    Completed = "Completed",
    Dropped = "Dropped",
    Paused = "On-Hold",
    Rewatching = "Re-watching",
};


export interface Series {
    malId?: number,
    anilistId?: number,

    title: string,
    status?: SeriesStatus,
    rating?: number,
    coverImage?: string,

    userStatus: UserStatus,
    userRating: number,
}
