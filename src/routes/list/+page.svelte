<script lang="ts">
    import { type Series } from "$lib/Series";
    import { onMount } from "svelte";

    import SeriesListEntry from "./seriesListEntry.svelte";
    import { miscState } from "$lib/settings.svelte";
    import { getFilteredList } from "$lib/storage";

    let seriesList: Series[] | null = $state(null);

    onMount(async () => {
        await fetchData();
    });

    async function fetchData() {
        try {
            seriesList = await getFilteredList();
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

    $effect(() => {
        const activeList = miscState.activeList;
        fetchData();
    });
</script>

{#if seriesList}
    <div class="flex flex-col w-full">
        {#each seriesList as series}
            <SeriesListEntry {...series} />
        {/each}
    </div>
{/if}
