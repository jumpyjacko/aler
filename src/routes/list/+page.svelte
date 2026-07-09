<script lang="ts">
    import { type Series } from "$lib/Series";
    import { onMount } from "svelte";

    import SeriesListEntry from "./seriesListEntry.svelte";
    import { miscState } from "$lib/settings.svelte";
    import { getFilteredList } from "$lib/storage";
    import { resolve } from "$app/paths";

    let seriesList: Series[] | null = $state(null);
    let loading: boolean = $state(true);

    onMount(async () => {
        await fetchData();
    });

    async function fetchData() {
        try {
            seriesList = await getFilteredList();
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        const activeList = miscState.activeList;
        fetchData();
    });
</script>

{#if !loading}
    {#if seriesList}
        <div
            class="flex w-full bottom-0 justify-center pt-4 px-2 bg-surface transition-colors duration-100"
        >
            <a
                href={resolve("/list/redistribute")}
                class="px-2 bg-primary-faded text-primary hover:bg-primary hover:text-primary-faded rounded-full shadow-sm transition-colors duration-100 cursor-pointer"
            >
                Redistribute Your Scores
            </a>
        </div>

        <div class="flex flex-col w-full">
            {#each seriesList as series, index}
                <SeriesListEntry {...series} {index} />
            {/each}
        </div>
    {:else}
        <div class="text-lg w-full text-center mt-10">No list loaded!</div>
    {/if}
{/if}
