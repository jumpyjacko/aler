<script lang="ts">
    import { type Series } from "$lib/Series";
    import { MatchOutcome, type Candidate } from "$lib/rating";
    import { Glicko } from "$lib/rating/glicko";
    import { getAllItems, putItem } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    import SeriesCandidate from "./seriesCandidate.svelte";

    let seriesList: Series[] | null = $state(null);

    let series1: Series | null = $state(null);
    let series2: Series | null = $state(null);

    const ratingSystem = new Glicko(); // TODO: make this an option that a user could switch with like Elo or Glicko-2

    let medianRD: number = $state(0);

    let activeList: string = "animelist";

    onMount(async () => {
        activeList = localStorage.getItem("activeList") ?? "animelist";
        const db: Series[] = await getAllItems(activeList);
        if (db.length === 0) return;
        seriesList = db;

        [series1, series2] = pickTwo(seriesList);
    });

    async function handleVote(winner: Series, loser: Series): Promise<void> {
        const [p1, p2] = ratingSystem.update(winner, loser, MatchOutcome.win);
        await updateEntry(winner, p1);
        await updateEntry(loser, p2);

        seriesList = await getAllItems(activeList); // TODO: probably not a good idea
        [series1, series2] = pickTwo(seriesList!);
    }

    async function handleDraw(): Promise<void> {
        const [p1, p2] = ratingSystem.update(
            series1!,
            series2!,
            MatchOutcome.draw,
        );
        await updateEntry(series1!, p1);
        await updateEntry(series2!, p2);

        seriesList = await getAllItems(activeList); // TODO: probably not a good idea
        [series1, series2] = pickTwo(seriesList!);
    }

    function handleSkip(): void {
        [series1, series2] = pickTwo(seriesList!);
    }

    async function updateEntry(
        series: Series,
        candidate: Candidate,
    ): Promise<void> {
        if (series) {
            series = {
                ...series,
                ...candidate,
            };
        }

        await putItem(activeList, series);
    }

    function pickTwo(list: Series[]): [Series, Series] {
        if (list.length < 2) {
            throw new Error(
                "The list must contain at least 2 items to sample unique values.",
            );
        }

        var index1;
        if (list.filter((s) => s.ratingDeviation > 200).length > 0) {
            list = list.sort((a, b) => b.ratingDeviation - a.ratingDeviation);
            index1 = Math.floor(Math.random() * (list.length * 0.05));
        } else {
            index1 = Math.floor(Math.random() * list.length);
        }

        const p1 = list[index1];

        if (Math.random() < 0.01) {
            // randomly pick true random bc why not
            // console.log("random pick!");
            const p2 = list[Math.floor(Math.random() * list.length)];
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

    $effect(() => {
        if (seriesList === null) return;

        const rds = seriesList
            .map((c) => c.ratingDeviation)
            .sort((a, b) => a - b);

        const mid = Math.floor(rds.length / 2);

        if (rds.length % 2 !== 0) {
            medianRD = rds[mid];
        } else {
            medianRD = (rds[mid - 1] + rds[mid - 1]) / 2;
        }
    });
</script>

{#if series1 && series2}
    <div
        class="
            flex flex-col justify-around px-4 divide-y
            md:flex-row md:w-full md:divide-y-0 md:divide-x divide-gray-300
        "
    >
        <button onclick={() => handleVote(series1!, series2!)} class="w-full">
            <SeriesCandidate {...series1} />
        </button>
        <button onclick={() => handleVote(series2!, series1!)} class="w-full">
            <SeriesCandidate {...series2} />
        </button>
    </div>

    <div class="flex flex-row gap-4 w-full justify-center mt-10">
        <button
            onclick={handleDraw}
            class="px-4 py-2 rounded-full bg-blue-400 text-white">Draw</button
        >
        <button
            onclick={handleSkip}
            class="px-4 py-2 rounded-full bg-blue-200 text-blue-500"
            >Skip</button
        >
    </div>
{/if}

<footer class="text-sm text-gray-600 fixed bottom-0 p-2">
    Median rating deviation: {medianRD}, aiming for around &lt;100
</footer>
