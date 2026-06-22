enum SeriesStatus { // TODO: consider generalising for other media?
    Airing,
    Completed,
    ToBeAired,
    Cancelled,
    Hiatus,
};

enum UserStatus { // TODO: consider generalising for other media?
    Watching,
    PlanToWatch,
    Completed,
    Dropped,
    Paused,
    Rewatching,
};


export interface Series {
    malId?: string,
    anilistId: string,

    title: string,
    status: SeriesStatus,
    rating: number,

    userStatus: UserStatus,
    userRating: number,
}
