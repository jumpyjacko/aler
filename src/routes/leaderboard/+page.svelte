<script lang="ts">
    import { type Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    import SeriesListEntry from "./seriesListEntry.svelte";

    let seriesList: Series[] | null = $state(null);

    onMount(async () => {
        const db: Series[] = await getAllItems("animelist");
        if (db.length === 0) return;
        seriesList = db.sort((a, b) => b.mmrRating - a.mmrRating);
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
