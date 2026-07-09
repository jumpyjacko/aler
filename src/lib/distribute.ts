// TheAlgorithms https://github.com/TheAlgorithms
const factorial = (num: number): number => {
    if (num < 0 || !Number.isInteger(num)) {
        throw new Error('only natural numbers are supported')
    }

    return num === 0 ? 1 : num * factorial(num - 1)
}

const binomialCoefficient = (n: number, k: number): number => {
    // Check if k is larger than n or negative
    if (k > n || k < 0) {
        return 0
    }

    // Calculate the binomial coefficient using the implemented factorial
    const numerator = factorial(n)
    const denominator = factorial(k) * factorial(n - k)
    return numerator / denominator
}

export function binomial(
    totalItems: number,
    bucketCount: number = 10,
    p: number,
    flatness: number
): number[] {
    const n = bucketCount - 1;
    let weights: number[] = [];
    let totalWeight = 0;

    for (let k = 0; k <= n; k++) {
        const raw = binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        const adjusted = Math.pow(raw, 1 / flatness);
        weights.push(adjusted);
        totalWeight += adjusted;
    }

    const giveEachOne = totalItems >= bucketCount;
    const base = giveEachOne ? 1 : 0;
    const pool = giveEachOne ? totalItems - bucketCount : totalItems;

    let bucketSizes: number[] = weights.map(w => base + Math.floor((w / totalWeight) * pool));

    let allocated = bucketSizes.reduce((a, b) => a + b, 0);
    let remainder = totalItems - allocated;

    if (remainder > 0) {
        let fractions = weights
            .map((w, i) => ({
                index: i,
                frac: (w / totalWeight) * pool - Math.floor((w / totalWeight) * pool),
            }))
            .sort((a, b) => b.frac - a.frac);

        for (let i = 0; i < remainder; i++) {
            bucketSizes[fractions[i].index]++;
        }
    }

    return bucketSizes;
}
