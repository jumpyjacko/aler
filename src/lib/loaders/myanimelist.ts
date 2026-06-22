import type { Series } from "$lib/Series";
import type { Loader } from "./loader.ts";

import { XMLParser } from "fast-xml-parser";

export class MALLoader implements Loader {
    readonly supportedExtension: string = ".xml";

    async load(file: File): Promise<Series[]> {
        const raw = await file.text();

        const parser = new XMLParser();

        let data = parser.parse(raw);

        console.log(data);

        throw new Error("Method not implemented.");
    }

    convertToAnilist?(): boolean {
        throw new Error("Method not implemented.");
    }
}
