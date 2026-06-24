import { SeriesStatus, UserStatus, type Series } from "$lib/Series";
import { sendQuery } from "$lib/clients/AniList";
import { ListType, type Loader } from ".";

import { XMLParser } from "fast-xml-parser";

export class MALLoader implements Loader {
    readonly supportedExtension: string = ".xml";
    listType: ListType = ListType.Anime;

    async load(file: File): Promise<Series[]> {
        const prefix = file.name.split('_')[0];
        if (prefix === "animelist") {
            this.listType = ListType.Anime;
        } else if (prefix === "mangalist") {
            this.listType = ListType.Manga;
        }

        const raw = await file.text();

        const parser = new XMLParser();
        const data = parser.parse(raw);

        let raw_list: any;
        switch (this.listType) {
            case ListType.Manga:
                raw_list = Array.isArray(data.myanimelist.manga)
                    ? data.myanimelist.manga
                    : data?.myanimelist?.manga ? [data.myanimelist.manga] : [];
                break;
            case ListType.Anime:
            default:
                raw_list = Array.isArray(data.myanimelist.anime)
                    ? data.myanimelist.anime
                    : data?.myanimelist?.anime ? [data.myanimelist.anime] : [];
        }


        const statusMap: Record<string, UserStatus> = {
            "Watching": UserStatus.Watching,
            "Plan to Watch": UserStatus.PlanToWatch,
            "Completed": UserStatus.Completed,
            "Dropped": UserStatus.Dropped,
            "On-Hold": UserStatus.Paused,

            "Reading": UserStatus.Reading,
            "Plan to Read": UserStatus.PlanToRead,
        };

        const list: Series[] = [];

        for (const raw_series of raw_list) {
            let status: UserStatus = statusMap[raw_series.my_status];

            // if (status === UserStatus.PlanToWatch) continue;

            if (status === undefined) throw new Error(`Unknown or missing user status: ${raw_series.my_status}`);

            let series: Series;

            switch (this.listType) {
                case ListType.Manga:
                    series = {
                        id: +raw_series.manga_mangadb_id,
                        malId: +raw_series.manga_mangadb_id,
                        title: raw_series.manga_title,
                        userStatus: status,
                        userRating: +raw_series.my_score,
                        readChapters: +raw_series.my_read_chapters,

                        mmrRating: 1500,
                        ratingDeviation: 350,
                    };
                    break;
                case ListType.Anime:
                default:
                    series = {
                        id: +raw_series.series_animedb_id,
                        malId: +raw_series.series_animedb_id,
                        title: raw_series.series_title,
                        userStatus: status,
                        userRating: +raw_series.my_score,

                        mmrRating: 1500,
                        ratingDeviation: 350,
                    }
                    break;
            }

            list.push(series);
        }

        return await fillFromAnilist(list, this.listType);
    }
}

async function fillFromAnilist(seriesList: Series[], listType: ListType): Promise<Series[]> {
    const query = `
        query Query($idMalIn: [Int], $type: MediaType) {
          Page {
            media(idMal_in: $idMalIn, type: $type) {
              id
              status
              meanScore
              coverImage {
                large
              }
              idMal
              title {
                english
                romaji
              }
            }
          }
        }
    `;

    const allMalIds = seriesList.map(s => s.malId);
    const CHUNK_SIZE = 50;
    const anilistMedia: any[] = [];

    for (let i = 0; i < allMalIds.length; i += CHUNK_SIZE) {
        const chunk = allMalIds.slice(i, i + CHUNK_SIZE);

        const variables = {
            idMalIn: chunk,
            type: listType,
        };

        try {
            const response = await sendQuery(query, JSON.stringify(variables));

            const media = response?.data?.Page?.media || [];
            anilistMedia.push(...media);
        } catch (err: any) {
            throw new Error(`Failed to fetch chunk starting at index ${i}: ${err}`);
        }
    }

    const statusMap: Record<string, SeriesStatus> = {
        "FINISHED": SeriesStatus.Completed,
        "RELEASING": SeriesStatus.Airing,
        "NOT_YET_RELEASED": SeriesStatus.ToBeReleased,
        "CANCELLED": SeriesStatus.Cancelled,
        "HIATUS": SeriesStatus.Hiatus,
    };

    const updatedSeriesList: Series[] = seriesList.map(series => {
        const potentialMatches = anilistMedia.filter(m => Number(m.idMal) === Number(series.malId));

        if (potentialMatches.length === 0) return series;
        if (potentialMatches.length > 1) throw new Error(`Duplicated entries for MAL ID: ${series.malId}`); // NOTE: should be like unreachable

        return {
            ...series,
            anilistId: potentialMatches[0].id,
            status: statusMap[potentialMatches[0].status],
            rating: potentialMatches[0].meanScore ?? undefined,
            coverImage: potentialMatches[0].coverImage?.large ?? undefined,
            id: potentialMatches[0].id, // internal storage id
        };
    });

    return updatedSeriesList;
}
