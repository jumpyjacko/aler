<script lang="ts">
    import type { Series } from "$lib/Series";
    import { getFilteredList } from "$lib/storage";
    import { onMount } from "svelte";

    let animeList: Series[] | null = $state(null);
    let loading: boolean = $state(true);

    onMount(async () => {
        fetchData();
    });

    async function fetchData() {
        try {
            animeList = await getFilteredList();
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="m-2">
    <div class="flex flex-row divide-x divide-text-faded">
        <!-- Match Stats -->
        <div class="flex flex-col p-4">
            <div class="text-2xl">
                <h3 class="text-text-faded text-lg">total matches</h3>
                {parseInt(localStorage.getItem("stats_matches") || "0", 10) +
                    parseInt(localStorage.getItem("stats_draws") || "0", 10)}
            </div>
            <div class="text-2xl">
                <h3 class="text-text-faded text-lg">decisions</h3>
                {localStorage.getItem("stats_matches") ?? 0}
            </div>
            <div class="text-2xl">
                <h3 class="text-text-faded text-lg">draws</h3>
                {localStorage.getItem("stats_draws") ?? 0}
            </div>
        </div>
        <div class="flex flex-col p-4">
            <div></div>
        </div>
    </div>
</div>
