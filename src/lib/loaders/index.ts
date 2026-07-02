import { SeriesType, type Series } from "$lib/Series";
import { addItemIfNotExists } from "$lib/storage/IndexedDB";
import { AniListLoader } from "./anilist";
import { MALLoader } from "./myanimelist";

export interface Loader {
    readonly supportedExtensions: string[];
    listType: SeriesType,
    file?: File,

    load(): Promise<Series[]>;

    convertToAnilist?(): boolean; // TODO: define a better return type here
}

const registeredLoaders: Loader[] = [
    new MALLoader,
];

export async function getList(file?: File): Promise<void> {
    let matchingLoader: Loader;
    if (file) {
        const loader = registeredLoaders.find((loader) =>
            loader.supportedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext.toLowerCase()))
        );

        if (!loader) throw new Error("No registered loader for filetype");
        matchingLoader = loader;
        matchingLoader.file = file;
    } else {
        throw new Error("Failed to detect a correct loader");
    }

    let seriesList = await matchingLoader.load();
    let store: string = "animelist"
    switch (matchingLoader.listType) {
        case SeriesType.Manga:
            store = "mangalist";
            break;
        case SeriesType.Anime:
        default:
            break;
    }

    for (const series of seriesList) {
        await addItemIfNotExists(store, series);
    }
}

export async function getAnilistLists(username: string): Promise<void> {
    if (username.length <= 0) throw new Error("No username provided");

    const loader = new AniListLoader;
    loader.username = username;

    await loader.load();
}
