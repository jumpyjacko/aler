<script lang="ts">
    import { type Series } from "$lib/Series";
    import { MatchOutcome } from "$lib/rating";
    import { Glicko } from "$lib/rating/glicko";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    import SeriesCandidate from "./seriesCandidate.svelte";

    let seriesList: Series[] | null = $state(null);

    let candidate1: Series | null = $state(null);
    let candidate2: Series | null = $state(null);

    const ratingSystem = new Glicko(); // TODO: make this an option that a user could switch with like Elo or Glicko-2

    onMount(async () => {
        const db: Series[] = await getAllItems("list");
        if (db.length === 0) return;
        seriesList = db;

        [candidate1, candidate2] = sampleTwoUnique(seriesList);
    });

    function handleVote(winner: Series, loser: Series) {
        ratingSystem.update(winner, loser, MatchOutcome.win);
        [candidate1, candidate2] = sampleTwoUnique(seriesList!);
    }

    function handleDraw(winner: Series, loser: Series) {
        ratingSystem.update(winner, loser, MatchOutcome.draw);
        [candidate1, candidate2] = sampleTwoUnique(seriesList!);
    }

    function sampleTwoUnique<T>(list: T[]): [T, T] {
        if (list.length < 2) {
            throw new Error(
                "The list must contain at least 2 items to sample unique values.",
            );
        }

        const index1 = Math.floor(Math.random() * list.length);
        let index2 = Math.floor(Math.random() * list.length);
        while (index2 === index1) {
            index2 = Math.floor(Math.random() * list.length);
        }

        return [list[index1], list[index2]];
    }
</script>

{#if candidate1 && candidate2}
    <div class="flex flex-row justify-around w-full divide-x divide-gray-300">
        <button
            onclick={() => handleVote(candidate1!, candidate2!)}
            class="w-full flex flex-col justify-center items-center"
        >
            <SeriesCandidate {...candidate1} />
        </button>
        <button
            onclick={() => handleVote(candidate2!, candidate1!)}
            class="w-full flex flex-col justify-center items-center"
        >
            <SeriesCandidate {...candidate2} />
        </button>
    </div>
{/if}
