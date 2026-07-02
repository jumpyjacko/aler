const ANILST_URL = "https://graphql.anilist.co";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let remainingRequests: number | null = null;
let resetTime: number | null = null; 
let isPaused = false;

async function throttleIfNeeded(): Promise<void> {
    while (isPaused || (remainingRequests !== null && remainingRequests <= 1 && resetTime !== null && Date.now() < resetTime)) {
        const now = Date.now();
        const msToWait = resetTime ? resetTime - now : 1000;
        
        if (msToWait > 0) {
            console.warn(`Proactive Throttling: Queueing request. Waiting ${Math.ceil(msToWait / 1000)}s...`);
            await delay(msToWait + 500);
        } else {
            await delay(500);
        }
    }
}

export async function sendQuery(query: string, variables: string): Promise<any> {
    const options: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ query, variables })
    };

    await throttleIfNeeded();

    try {
        const response = await fetch(ANILST_URL, options);

        const limitHeader = response.headers.get("x-ratelimit-limit");
        const remainingHeader = response.headers.get("x-ratelimit-remaining");
        const resetHeader = response.headers.get("x-ratelimit-reset");

        if (remainingHeader) remainingRequests = parseInt(remainingHeader, 10);
        if (resetHeader) resetTime = parseInt(resetHeader, 10) * 1000;

        console.log(`Request ${remainingHeader} of ${limitHeader} allowed. Resets at: ${resetTime}`);

        if (response.status === 429) {
            isPaused = true; 

            const retryAfter = response.headers.get("retry-after");
            const secondsToWait = retryAfter ? parseInt(retryAfter, 10) : 60;
            
            console.error(`!!!! HIT RATE LIMIT !!!! Lockout active. Waiting ${secondsToWait}s.`);

            if (resetHeader) {
                resetTime = parseInt(resetHeader, 10) * 1000;
            } else {
                resetTime = Date.now() + (secondsToWait * 1000);
            }
            remainingRequests = 0;

            await delay(secondsToWait * 1000 + 500);
            
            isPaused = false;
            return await sendQuery(query, variables);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const body = await response.json();
        return handleData(body);

    } catch (error) {
        isPaused = false; 
        return handleError(error);
    }
}

function handleData(data: any): any {
    return data;
}

function handleError(error: unknown): never {
    console.error("Request failed:", error);
    throw error;
}
