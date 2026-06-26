import { SeriesType, type Series } from "$lib/Series";
import { getAllItems, putItem } from "$lib/storage/IndexedDB";
import { MALLoader } from "./myanimelist";

export interface Loader {
    readonly supportedExtensions: string[];
    listType: SeriesType,

    load(file: File): Promise<Series[]>;

    convertToAnilist?(): boolean; // TODO: define a better return type here
}

const registeredLoaders: Loader[] = [
    new MALLoader,
];

export async function getList(file: File): Promise<Series[]> {
    const matchingLoader = registeredLoaders.find((loader) =>
        loader.supportedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext.toLowerCase()))
    );

    if (!matchingLoader) throw new Error("No registered loader for filetype");

    let seriesList = await matchingLoader.load(file);

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
        await putItem(store, series);
    }

    return getAllItems(store);
}
