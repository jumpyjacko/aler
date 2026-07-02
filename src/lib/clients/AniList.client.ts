const ANILST_URL = "https://graphql.anilist.co";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequestTime = 0;
let remainingRequests: number | null = null;
let resetTime: number | null = null;
const MIN_INTERVAL_MS = 2000;
const MAX_RETRIES = 5;

export async function sendQuery(query: string, variables: string, retries = 0): Promise<any> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_INTERVAL_MS) {
        await delay(MIN_INTERVAL_MS - timeSinceLastRequest);
    }

    if (remainingRequests !== null && resetTime !== null && remainingRequests <= 1) {
        const msToWait = resetTime - Date.now();
        if (msToWait > 0) {
            console.warn(`Throttling: ${Math.ceil(msToWait / 1000)}s until rate limit reset...`);
            await delay(msToWait + 1000);
        }
    }

    const options: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ query, variables })
    };

    lastRequestTime = Date.now();

    try {
        const response = await fetch(ANILST_URL, options);

        const limitHeader = response.headers.get("x-ratelimit-limit");
        const remainingHeader = response.headers.get("x-ratelimit-remaining");
        const resetHeader = response.headers.get("x-ratelimit-reset");

        if (remainingHeader) remainingRequests = parseInt(remainingHeader, 10);
        if (resetHeader) resetTime = parseInt(resetHeader, 10) * 1000;

        console.log(`[${remainingHeader ?? "?"}/${limitHeader ?? "?"}] remaining. Resets at: ${resetTime}`);

        if (response.status === 429) {
            if (retries >= MAX_RETRIES) {
                throw new Error("Exceeded max retries on rate limit");
            }

            const retryAfter = response.headers.get("retry-after");
            const secondsToWait = retryAfter ? parseInt(retryAfter, 10) : 60;

            console.error(`429: waiting ${secondsToWait}s (retry ${retries + 1}/${MAX_RETRIES})`);

            remainingRequests = 0;
            resetTime = resetHeader
                ? parseInt(resetHeader, 10) * 1000
                : Date.now() + secondsToWait * 1000;

            await delay(secondsToWait * 1000 + 500);
            return sendQuery(query, variables, retries + 1);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        if (retries >= MAX_RETRIES) {
            throw error;
        }

        if (resetTime && Date.now() < resetTime) {
            const msToWait = resetTime - Date.now() + 1000;
            console.error(`Network error (likely 429), waiting ${Math.ceil(msToWait / 1000)}s (retry ${retries + 1}/${MAX_RETRIES})`);
            await delay(msToWait);
            return sendQuery(query, variables, retries + 1);
        }

        const backoff = Math.min(1000 * Math.pow(2, retries), 30000);
        console.error(`Network error, retrying in ${backoff / 1000}s (retry ${retries + 1}/${MAX_RETRIES})`, error);
        await delay(backoff);
        return sendQuery(query, variables, retries + 1);
    }
}
