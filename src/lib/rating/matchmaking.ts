import { MediaType, UserStatus, type Series } from "$lib/Series";

export function pickTwo(list: Series[]): [Series, Series] {
    if (list.length < 2) {
        throw new Error(
            "The list must contain at least 2 items to sample unique values.",
        );
    }

    var index1;
    if (list.filter((s) => s.ratingDeviation > 200).length > 0) {
        list = list.sort(
            (a, b) => b.ratingDeviation - a.ratingDeviation,
        );
        index1 = Math.floor(Math.random() * (list.length * 0.05));
    } else {
        index1 = Math.floor(Math.random() * list.length);
    }

    const p1 = list[index1];

    if (Math.random() < 0.01) {
        // randomly pick true random bc why not
        // console.log("random pick!");
        const p2 =
            list[Math.floor(Math.random() * list.length)];
        return [p1, p2];
    }

    const upperBound = p1.mmrRating + 2 * p1.ratingDeviation;
    const lowerBound = p1.mmrRating - 2 * p1.ratingDeviation;

    const matchmakingPool = list
        .filter((s) => s.mmrRating >= lowerBound)
        .filter((s) => s.mmrRating <= upperBound);

    let index2 = Math.floor(Math.random() * matchmakingPool.length);
    while (matchmakingPool[index2].id === p1.id) {
        index2 = Math.floor(Math.random() * matchmakingPool.length);
    }

    const p2 = matchmakingPool[index2];

    return [p1, p2];
}
