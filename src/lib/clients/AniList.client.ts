import { browser } from "$app/env";
import Bottleneck from "bottleneck";

let initialReservoir = 30;
if (browser) {
    const savedReservoir = localStorage.getItem("bottleneck_reservoir");
    initialReservoir = savedReservoir ? parseInt(savedReservoir, 10) : 30;
}

// Limiter configuration from https://github.com/RockinChaos/Shiru/blob/master/common/modules/anilist.js#L152
const ANILST_URL = "https://graphql.anilist.co";
const limiter = new Bottleneck({
    reservoir: initialReservoir, // TODO: degraded api rn, gotta lower it
    reservoirRefreshAmount: 30,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 1,
    minTime: 100
});

// persist bottleneck status through reloads and stuff
if (browser) {
    setInterval(async () => {
        const current = await limiter.currentReservoir();
        localStorage.setItem("bottleneck_reservoir", String(current));
    }, 1000);
    window.addEventListener("beforeunload", async () => {
        const current = await limiter.currentReservoir();
        localStorage.setItem("bottleneck_reservoir", String(current));
    });
}

// Example taken from https://docs.anilist.co/guide/graphql/
export async function sendQuery(query: string, variables: string): Promise<any> {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            query: query,
            variables: variables,
        })
    };

    if (limiter.empty()) {
        console.warn("Rate limited!");
    }

    return limiter.schedule(() => fetch(ANILST_URL, options)).then(handleResponse).then(handleData).catch(handleError);
}

async function handleResponse(response: Response) {
    return response.json().then(function(json) {
        return response.ok ? json : Promise.reject(json);
    })
}

function handleError(error: any) {
    console.error(error);
    throw error;
}

function handleData(data: any) {
    // console.log(limiter.queued(), limiter.currentReservoir()); // DEBUG
    return data;
}
