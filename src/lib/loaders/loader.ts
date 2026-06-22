import type { Series } from "$lib/Series";
import { MALLoader } from "./myanimelist";

export interface Loader {
    readonly supportedExtension: string;

    load(file: File): Promise<Series[]>;

    convertToAnilist?(): boolean; // TODO: define a better return type here
}

const registeredLoaders: Loader[] = [
    new MALLoader,
];

export async function getParsedData(file: File): Promise<Series[]> {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    const matchingLoader = registeredLoaders.find(
        (loader) => loader.supportedExtension === extension
    );

    if (!matchingLoader) throw new Error(`No registered loader for filetype: ${extension}`);

    return await matchingLoader.load(file);
}
