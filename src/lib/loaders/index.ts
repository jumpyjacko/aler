import type { Series } from "$lib/Series";
import { getAllItems, putItem } from "$lib/storage/IndexedDB";
import { MALLoader } from "./myanimelist";

export interface Loader {
    readonly supportedExtension: string;

    load(file: File): Promise<Series[]>;

    convertToAnilist?(): boolean; // TODO: define a better return type here
}

const registeredLoaders: Loader[] = [
    new MALLoader,
];

export async function getList(file: File): Promise<Series[]> {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    const matchingLoader = registeredLoaders.find(
        (loader) => loader.supportedExtension === extension
    );

    if (!matchingLoader) throw new Error(`No registered loader for filetype: ${extension}`);

    let seriesList = await matchingLoader.load(file);

    for (const series of seriesList) {
        await putItem("list", series);
    }

    return getAllItems("list");
}
