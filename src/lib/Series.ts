export enum SeriesStatus { // TODO: consider generalising for other media?
    Airing,
    Completed,
    ToBeAired,
    Cancelled,
    Hiatus,
};

export enum UserStatus { // TODO: consider generalising for other media?
    Watching,
    PlanToWatch,
    Completed,
    Dropped,
    Paused,
    Rewatching,
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
