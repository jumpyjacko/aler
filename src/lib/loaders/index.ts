import { SeriesType, type Series } from "$lib/Series";
import { getAllItems, putItem } from "$lib/storage/IndexedDB";
import { MALLoader } from "./myanimelist";

export interface Loader {
    readonly supportedExtension: string;
    listType: SeriesType,

    load(file: File): Promise<Series[]>;

    convertToAnilist?(): boolean; // TODO: define a better return type here
}

const registeredLoaders: Loader[] = [
    new MALLoader,
];

export async function getList(file: File): Promise<Series[]> {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    const matchingLoader = registeredLoaders.find( // TODO: make this support MALExport maybe?
        (loader) => loader.supportedExtension === extension
    );

    if (!matchingLoader) throw new Error(`No registered loader for filetype: ${extension}`);

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
