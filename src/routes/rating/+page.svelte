<script lang="ts">
    import { type Series } from "$lib/Series";
    import { MatchOutcome, type Candidate } from "$lib/rating";
    import { Glicko } from "$lib/rating/glicko";
    import { getAllItems, putItem } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    import SeriesCandidate from "./seriesCandidate.svelte";

    let seriesList: Series[] | null = null;

    let series1: Series | null = $state(null);
    let series2: Series | null = $state(null);

    const ratingSystem = new Glicko(); // TODO: make this an option that a user could switch with like Elo or Glicko-2

    onMount(async () => {
        const db: Series[] = await getAllItems("list");
        if (db.length === 0) return;
        seriesList = db;

        [series1, series2] = pickTwo(seriesList);
    });

    async function handleVote(winner: Series, loser: Series): Promise<void> {
        const [p1, p2] = ratingSystem.update(winner, loser, MatchOutcome.win);
        await updateEntry(winner, p1);
        await updateEntry(loser, p2);

        seriesList = await getAllItems("list"); // TODO: probably not a good idea
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

        seriesList = await getAllItems("list"); // TODO: probably not a good idea
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

        await putItem("list", series);
    }

    function pickTwo(list: Series[]): [Series, Series] {
        if (list.length < 2) {
            throw new Error(
                "The list must contain at least 2 items to sample unique values.",
            );
        }

        const index1 = Math.floor(Math.random() * list.length);
        const p1 = list[index1];
        const upperBound = p1.mmrRating + 2 * p1.ratingDeviation;
        const lowerBound = p1.mmrRating - 2 * p1.ratingDeviation;

        const matchmakingPool = list
            .filter((s) => s.mmrRating >= lowerBound)
            .filter((s) => s.mmrRating <= upperBound);

        let index2 = Math.floor(Math.random() * matchmakingPool.length);
        while (matchmakingPool[index2].id === p1.id) {
            index2 = Math.floor(Math.random() * matchmakingPool.length);
        }

        const p2 = list[index2];

        return [p1, p2];
    }
</script>

{#if series1 && series2}
    <div class="flex flex-row justify-around w-full divide-x divide-gray-300">
        <button
            onclick={() => handleVote(series1!, series2!)}
            class="w-full flex flex-col justify-center items-center"
        >
            <SeriesCandidate {...series1} />
        </button>
        <button
            onclick={() => handleVote(series2!, series1!)}
            class="w-full flex flex-col justify-center items-center"
        >
            <SeriesCandidate {...series2} />
        </button>
    </div>

    <div class="flex flex-row gap-4 w-full justify-center mt-10">
        <button
            onclick={handleDraw}
            class="px-4 py-2 rounded-full bg-blue-500 text-white">Draw</button
        >
        <button
            onclick={handleSkip}
            class="px-4 py-2 rounded-full bg-blue-200 text-blue-800"
            >Skip</button
        >
    </div>
{/if}
