<script lang="ts">
    import { MediaType, UserStatus, type Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    import SeriesListEntry from "./seriesListEntry.svelte";
    import { miscState } from "$lib/settings.svelte";

    let seriesList: Series[] | null = $state(null);

    onMount(async () => {
        await fetchData();
    });

    async function fetchData() {
        const excludePTW = localStorage.getItem("excludePlanning") === "true";
        const excludeOS = localStorage.getItem("excludeOneshots") === "true";
        const excludeMVS = localStorage.getItem("excludeMovies") === "true";

        try {
            const db: Series[] = await getAllItems(miscState.activeList);
            if (db.length === 0) return;
            seriesList = db
                .filter((s) => {
                    if (
                        excludePTW &&
                        (s.userStatus === UserStatus.PlanToWatch ||
                            s.userStatus === UserStatus.PlanToRead)
                    ) {
                        return false;
                    }
                    if (excludeOS && s.readChapters! <= 1) {
                        return false;
                    }
                    if (excludeMVS && s.mediaType! === MediaType.Movie) {
                        return false;
                    }

                    return true;
                })
                .sort((a, b) => b.mmrRating - a.mmrRating);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

    $effect(() => {
        const activeList = miscState.activeList;
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
