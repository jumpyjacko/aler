import { MediaType, UserStatus, type Series } from "$lib/Series";

export function pickTwo(list: Series[]): [Series, Series] {
    const excludePTW = localStorage.getItem("excludePlanning") === "true";
    const excludeOS = localStorage.getItem("excludeOneshots") === "true";
    const excludeMVS = localStorage.getItem("excludeMovies") === "true";

    let filteredList = list.filter((s) => {
        if (
            excludePTW &&
            (s.userStatus === UserStatus.PlanToWatch ||
                s.userStatus === UserStatus.PlanToRead)
        ) {
            return false;
        }
        if (excludeOS && s.readChapters! <= 1) {
            return false;
        }
        if (excludeMVS && s.mediaType! === MediaType.Movie) {
            return false;
        }

        return true;
    });

    if (filteredList.length < 2) {
        throw new Error(
            "The list must contain at least 2 items to sample unique values.",
        );
    }

    var index1;
    if (filteredList.filter((s) => s.ratingDeviation > 200).length > 0) {
        filteredList = filteredList.sort(
            (a, b) => b.ratingDeviation - a.ratingDeviation,
        );
        index1 = Math.floor(Math.random() * (filteredList.length * 0.05));
    } else {
        index1 = Math.floor(Math.random() * filteredList.length);
    }

    const p1 = filteredList[index1];

    if (Math.random() < 0.01) {
        // randomly pick true random bc why not
        // console.log("random pick!");
        const p2 =
            filteredList[Math.floor(Math.random() * filteredList.length)];
        return [p1, p2];
    }

    const upperBound = p1.mmrRating + 2 * p1.ratingDeviation;
    const lowerBound = p1.mmrRating - 2 * p1.ratingDeviation;

    const matchmakingPool = filteredList
        .filter((s) => s.mmrRating >= lowerBound)
        .filter((s) => s.mmrRating <= upperBound);

    let index2 = Math.floor(Math.random() * matchmakingPool.length);
    while (matchmakingPool[index2].id === p1.id) {
        index2 = Math.floor(Math.random() * matchmakingPool.length);
    }

    const p2 = matchmakingPool[index2];

    return [p1, p2];
}
