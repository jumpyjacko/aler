import { MediaType, SeriesStatus, SeriesType, UserStatus, type Series } from "$lib/Series";
import { sendQuery } from "$lib/clients/AniList.client";
import { getAllItems } from "$lib/storage/IndexedDB";
import { type Loader } from ".";

import { XMLParser } from "fast-xml-parser";

export class MALLoader implements Loader {
    readonly supportedExtensions: string[] = [".xml", ".xml.gz"];
    listType: SeriesType = SeriesType.Anime;
    file?: File;

    async load(): Promise<Series[]> {
        if (!this.file) throw new Error("No file?");

        let fileToParse = this.file;
        if (this.file.name.endsWith('.gz')) {
            const decompressedStream = this.file.stream().pipeThrough(new DecompressionStream("gzip"));
            const decompressedBlob = await new Response(decompressedStream).blob();

            fileToParse = new File([decompressedBlob], this.file.name.replace('.gz', ''), { type: 'text/xml' });
        }

        const raw = await fileToParse.text();

        const parser = new XMLParser();
        const data = parser.parse(raw);

        let raw_list: any;
        const hasAnime = data?.myanimelist?.anime &&
            (!Array.isArray(data.myanimelist.anime) || data.myanimelist.anime.length > 0);

        const hasManga = data?.myanimelist?.manga &&
            (!Array.isArray(data.myanimelist.manga) || data.myanimelist.manga.length > 0);

        if (hasAnime) {
            this.listType = SeriesType.Anime;
            raw_list = Array.isArray(data.myanimelist.anime)
                ? data.myanimelist.anime
                : [data.myanimelist.anime];
        } else if (hasManga) {
            this.listType = SeriesType.Manga;
            raw_list = Array.isArray(data.myanimelist.manga)
                ? data.myanimelist.manga
                : [data.myanimelist.manga];
        } else {
            this.listType = SeriesType.Anime;
            throw new Error("Couldn't determine type of list.");
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

            if (status === undefined) throw new Error(`Unknown or missing user status: ${raw_series.my_status}`);

            let series: Series;

            switch (this.listType) {
                case SeriesType.Manga:
                    series = {
                        id: +raw_series.manga_mangadb_id,
                        seriesType: this.listType,
                        malId: +raw_series.manga_mangadb_id,
                        title: raw_series.manga_title,
                        userStatus: status,
                        userRating: +raw_series.my_score,
                        readChapters: +raw_series.my_read_chapters,

                        mmrRating: 0,
                        ratingDeviation: 0,
                    };
                    break;
                case SeriesType.Anime:
                default:
                    let mediaType = raw_series.series_type === "TV" ?
                        MediaType.Anime :
                        raw_series.series_type === "Movie" ?
                            MediaType.Movie :
                            MediaType.Anime;
                    series = {
                        id: +raw_series.series_animedb_id,
                        seriesType: this.listType,
                        malId: +raw_series.series_animedb_id,
                        title: raw_series.series_title,
                        userStatus: status,
                        userRating: +raw_series.my_score,
                        mediaType: mediaType,

                        mmrRating: 0,
                        ratingDeviation: 0,
                    }
                    break;
            }

            let initialRating = series.userRating === 0 ? 1350 : Math.round((series.userRating * 700 + 8300) / 9);
            series = {
                ...series,
                mmrRating: initialRating,
                ratingDeviation: 350,
            };

            list.push(series);
        }

        return await fillFromAnilist(list, this.listType);
    }
}

async function fillFromAnilist(seriesList: Series[], listType: SeriesType): Promise<Series[]> {
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

    const currentList: Series[] = listType === SeriesType.Anime ?
        await getAllItems("animelist") :
        await getAllItems("mangalist");

    const existingMalIds = new Set(currentList.map(s => s.malId));
    const allMalIds = seriesList.map(s => s.malId).filter((id): id is number =>
        id !== undefined && !existingMalIds.has(id)
    );
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
        "RELEASING": SeriesStatus.Releasing,
        "NOT_YET_RELEASED": SeriesStatus.ToBeReleased,
        "CANCELLED": SeriesStatus.Cancelled,
        "HIATUS": SeriesStatus.Hiatus,
    };

    const updatedSeriesList: Series[] = seriesList.map(series => {
        const potentialMatches = anilistMedia.filter(m => Number(m.idMal) === Number(series.malId));

        if (potentialMatches.length === 0) return series;
        if (potentialMatches.length > 1) {
            const normalisedTitle = normaliseTitle(series.title);

            let candidateList = potentialMatches.filter(m => {
                const normalisedRomaji = normaliseTitle(m.title?.romaji);
                const normalisedEnglish = normaliseTitle(m.title?.english);

                return normalisedRomaji === normalisedTitle || normalisedEnglish === normalisedTitle;
            })

            if (candidateList.length === 0) return series;
            if (candidateList.length > 1) {
                console.error("Couldn't find a best match, using first entry!", candidateList);
            }

            const bestMatch = candidateList[0];
            return {
                ...series,
                anilistId: bestMatch.id,
                status: statusMap[bestMatch.status],
                rating: bestMatch.meanScore ?? undefined,
                coverImage: bestMatch.coverImage?.large ?? undefined,
                id: bestMatch.id,
            }
        };

        const exactMatch = potentialMatches[0];
        return {
            ...series,
            anilistId: exactMatch.id,
            status: statusMap[exactMatch.status],
            rating: exactMatch.meanScore ?? undefined,
            coverImage: exactMatch.coverImage?.large ?? undefined,
        };
    });

    return updatedSeriesList;
}

function normaliseTitle(title: string | null | undefined): string {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};
