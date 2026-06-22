import { UserStatus, type Series } from "$lib/Series";
import type { Loader } from "./loader.ts";

import { XMLParser } from "fast-xml-parser";

export class MALLoader implements Loader {
    readonly supportedExtension: string = ".xml";

    async load(file: File): Promise<Series[]> {
        const raw = await file.text();

        const parser = new XMLParser();
        const data = parser.parse(raw);

        const raw_list = Array.isArray(data.myanimelist.anime)
            ? data.myanimelist.anime
            : data?.myanimelist?.anime ? [data.myanimelist.anime] : [];

        const statusMap: Record<string, UserStatus> = {
            "Watching": UserStatus.Watching,
            "Plan to Watch": UserStatus.PlanToWatch,
            "Completed": UserStatus.Completed,
            "Dropped": UserStatus.Dropped,
            "On-Hold": UserStatus.Paused,
            "Rewatching": UserStatus.Rewatching,
        };

        const list: Series[] = [];

        for (const raw_series of raw_list) {
            let status: UserStatus = statusMap[raw_series.my_status];

            if (status === undefined) throw new Error(`Unknown or missing user status: ${raw_series.my_status}`);

            const series: Series = {
                malId: +raw_series.series_animedb_id,
                title: raw_series.series_title,
                userStatus: status,
                userRating: +raw_series.my_score,
            }

            list.push(series);
        }

        return list;
    }

    convertToAnilist?(): boolean {
        throw new Error("Method not implemented.");
    }
}
