import { MediaType, UserStatus, type Series } from "$lib/Series";
import { miscState, scoreRange } from "$lib/settings.svelte";
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

            if (s.userScore < scoreRange.start || s.userScore >= scoreRange.end) {
                return false;
            }

            return true;
        })
        .sort((a, b) => b.mmrRating - a.mmrRating);
}

export async function getIndexedDBUsage(): Promise<StorageEstimate> {
    if (!navigator.storage || !navigator.storage.estimate) {
        throw new Error("Storage Manager API is not supported by this browser.");
    }
    return await navigator.storage.estimate();
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
