import { MediaType, UserStatus, type Series } from "$lib/Series";
import { miscState } from "$lib/settings.svelte";
import { getAllItems } from "./IndexedDB";

export async function getFilteredList(): Promise<Series[]> {
    const excludePlanning = localStorage.getItem("excludePlanning") === "true"; // TODO: make this procedural
    const excludeOneshots = localStorage.getItem("excludeOneshots") === "true";
    const excludeMovies = localStorage.getItem("excludeMovies") === "true";
    const excludeDropped = localStorage.getItem("excludeDropped") === "true";

    const db: Series[] = await getAllItems(miscState.activeList);
    if (db.length === 0) throw new Error("Found no items in database");

    return db
        .filter((s) => {
            if (
                excludePlanning &&
                (s.userStatus === UserStatus.PlanToWatch ||
                    s.userStatus === UserStatus.PlanToRead)
            ) {
                return false;
            }
            if (excludeDropped && s.userStatus === UserStatus.Dropped) {
                return false;
            }
            if (excludeOneshots && s.readChapters! <= 1) {
                return false;
            }
            if (excludeMovies && s.mediaType! === MediaType.Movie) {
                return false;
            }

            return true;
        })
        .sort((a, b) => b.mmrRating - a.mmrRating);
}
