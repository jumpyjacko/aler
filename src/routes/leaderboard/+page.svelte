<script lang="ts">
    import { type Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    import SeriesListEntry from "./seriesListEntry.svelte";
    import { globalState } from "../globalState.svelte";

    let seriesList: Series[] | null = $state(null);

    onMount(async () => {
        await fetchData();
    });

    async function fetchData() {
        try {
            const db: Series[] = await getAllItems(globalState.activeList);
            if (db.length === 0) return;
            seriesList = db.sort((a, b) => b.mmrRating - a.mmrRating);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

    $effect(() => {
        const activeList = globalState.activeList;
        fetchData();
    });
</script>

<div>
    design idea: top is a podium of the first three

    <br />
    <br />
    below that will be the list of all pieces of media, their stats, their current
    ranking, their current user rating and their recommended rating.
</div>

{#if seriesList}
    <div class="flex flex-col w-full">
        {#each seriesList as series}
            <SeriesListEntry {...series} />
        {/each}
    </div>
{/if}
