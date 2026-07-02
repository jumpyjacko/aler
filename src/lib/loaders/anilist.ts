import { sendQuery } from "$lib/clients/AniList.client";
import { MediaType, SeriesStatus, SeriesType, UserStatus, type Series } from "$lib/Series";
import { addItemIfNotExists } from "$lib/storage/IndexedDB";

export class AniListLoader {
    username: string = ""; // NOTE: this is known to exist

    async load(): Promise<void> {
        console.log(this.username);

        const query = `
            query Page($userName: String, $page: Int) {
              Page(page: $page) {
                pageInfo {
                  currentPage
                  hasNextPage
                  lastPage
                }
                mediaList(userName: $userName) {
                  media {
                    id
                    idMal
                    status
                    type
                    format
                    title {
                      userPreferred
                    }
                    coverImage {
                      large
                    }
                    meanScore
                  }
                  score
                  progress
                  status
                }
              }
            }
        `;

        const variables = {
            userName: this.username,
            page: 1,
        };

        const originalList = [];

        const animeList = [];
        const mangaList = [];

        while (true) {
            try {
                console.log(`Fetching page ${variables.page} of ${variables.username}`);
                console.log(JSON.stringify(variables));
                const response = await sendQuery(query, JSON.stringify(variables));
                const nextPage = response?.data?.Page?.pageInfo?.hasNextPage || false;
                if (!nextPage) break;

                const mediaList = response?.data?.Page?.mediaList || [];
                originalList.push(...mediaList);
                variables.page += 1;
            } catch (err: any) {
                throw new Error(`Failed to fetch page ${variables.page} of MediaList: ${err}`);
            }
        }

        for (const series of originalList) {
            let mediaType = series.media.format === "TV" ?
                MediaType.Anime :
                series.media.format === "MOVIE" ?
                    MediaType.Movie :
                    MediaType.Anime;

            let seriesType = seriesTypeMap[series.media.type];

            let initialRating = series.score === 0 ? 1350 : Math.round((series.score * 700 + 8300) / 9);

            let entry: Series = {
                id: +series.media.id,
                malId: +series.media.idMal,
                anilistId: +series.media.id,
                status: statusMap[series.media.status],
                seriesType: seriesType,
                title: series.media.title.userPreferred,
                rating: series.media.meanScore,
                coverImage: series.media.coverImage.large,
                userRating: +series.score,
                mediaType: mediaType,

                mmrRating: initialRating,
                ratingDeviation: 350,
                userStatus: UserStatus.Watching
            }

            switch (seriesType) {
                case SeriesType.Manga:
                    entry.userStatus = userStatusMap_m[series.status];
                    mangaList.push(entry);
                    break;
                case SeriesType.Anime:
                default:
                    entry.userStatus = userStatusMap[series.status];
                    animeList.push(entry);
                    break;
            }
        }

        for (const s of animeList) {
            await addItemIfNotExists("animelist", s);
        }

        for (const s of mangaList) {
            await addItemIfNotExists("mangalist", s);
        }
    }
}

const statusMap: Record<string, SeriesStatus> = {
    "FINISHED": SeriesStatus.Completed,
    "RELEASING": SeriesStatus.Releasing,
    "NOT_YET_RELEASED": SeriesStatus.ToBeReleased,
    "CANCELLED": SeriesStatus.Cancelled,
    "HIATUS": SeriesStatus.Hiatus,
};

const userStatusMap: Record<string, UserStatus> = {
    "CURRENT": UserStatus.Watching,
    "REPEATING": UserStatus.Watching,
    "PLANNING": UserStatus.PlanToWatch,
    "COMPLETED": UserStatus.Completed,
    "DROPPED": UserStatus.Dropped,
    "PAUSED": UserStatus.Paused,
};

const userStatusMap_m: Record<string, UserStatus> = {
    "CURRENT": UserStatus.Reading,
    "REPEATING": UserStatus.Reading,
    "PLANNING": UserStatus.PlanToRead,
    "COMPLETED": UserStatus.Completed,
    "DROPPED": UserStatus.Dropped,
    "PAUSED": UserStatus.Paused,
};

const seriesTypeMap: Record<string, SeriesType> = {
    "ANIME": SeriesType.Anime,
    "MANGA": SeriesType.Manga,
}
