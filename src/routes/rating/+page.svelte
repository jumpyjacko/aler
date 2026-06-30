<script lang="ts">
    import { type Series } from "$lib/Series";
    import { MatchOutcome, type Candidate } from "$lib/rating";
    import { Glicko } from "$lib/rating/glicko";
    import { putItem } from "$lib/storage/IndexedDB";
    import { pickTwo } from "$lib/rating/matchmaking";
    import { onMount } from "svelte";

    import SeriesCandidate from "./seriesCandidate.svelte";
    import { miscState } from "$lib/settings.svelte";
    import { getFilteredList } from "$lib/storage";

    let seriesList: Series[] | null = $state(null);

    let series1: Series | null = $state(null);
    let series2: Series | null = $state(null);

    const ratingSystem = new Glicko(); // TODO: make this an option that a user could switch with like Elo or Glicko-2

    let medianRD: number = $state(0);

    let loading: boolean = $state(true);

    onMount(async () => {
        fetchData();
    });

    async function fetchData() {
        try {
            seriesList = await getFilteredList();
            [series1, series2] = pickTwo(seriesList);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            loading = false;
        }
    }

    async function handleVote(winner: Series, loser: Series): Promise<void> {
        const [p1, p2] = ratingSystem.update(winner, loser, MatchOutcome.win);
        await updateEntry(winner, p1);
        await updateEntry(loser, p2);

        seriesList = await getFilteredList();
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

        seriesList = await getFilteredList();
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

        await putItem(miscState.activeList, series);
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

    $effect(() => {
        const activeList = miscState.activeList; // throwaway state so it reacts properly
        fetchData();
    });
</script>

{#if !loading}
    {#if series1 && series2}
        <div
            class="
            flex flex-col justify-around px-4 divide-y mt-[5vh]
            md:flex-row md:w-full md:divide-y-0 md:divide-x divide-text-faded
        "
        >
            <button
                onclick={() => handleVote(series1!, series2!)}
                class="w-full cursor-pointer"
            >
                <SeriesCandidate {...series1} />
            </button>
            <button
                onclick={() => handleVote(series2!, series1!)}
                class="w-full cursor-pointer"
            >
                <SeriesCandidate {...series2} />
            </button>
        </div>

        <div class="flex flex-row gap-4 w-full justify-center md:mt-10 mb-16">
            <button
                onclick={handleDraw}
                class="px-4 py-2 rounded-full bg-primary text-primary-faded shadow-sm cursor-pointer transition-colors duration-100"
                >Draw</button
            >
            <button
                onclick={handleSkip}
                class="px-4 py-2 rounded-full bg-primary-faded text-primary-dimmed shadow-sm cursor-pointer transition-colors duration-100"
                >Skip</button
            >
        </div>

        <footer class="text-sm text-text-faded fixed bottom-0 p-2 bg-surface">
            Median rating deviation: {medianRD}, aiming for around &lt;100
        </footer>
    {:else}
        <div class="text-lg w-full text-center mt-10">No list loaded!</div>
    {/if}
{/if}
