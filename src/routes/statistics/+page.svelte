<script lang="ts">
    import type { Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";
    import SectionListInfo from "./section_ListInfo.svelte";
    import SectionRatingDistribution from "./section_RatingDistribution.svelte";

    let animelist: Series[] | null = $state(null);
    let mangalist: Series[] | null = $state(null);

    let stats_matches: number = $state(0);
    let stats_draws: number = $state(0);

    let loading: boolean = $state(true);

    onMount(async () => {
        fetchData();
    });

    async function fetchData() {
        try {
            animelist = await getAllItems("animelist");
            mangalist = await getAllItems("mangalist");

            stats_matches = parseInt(
                localStorage.getItem("stats_matches") || "0",
                10,
            );
            stats_draws = parseInt(
                localStorage.getItem("stats_draws") || "0",
                10,
            );
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="m-2">
    <div class="flex flex-col">
        <div class="flex flex-row w-full">
            <!-- Match Stats -->
            <div class="flex flex-col p-4">
                <div class="text-2xl">
                    <h3 class="text-text-faded text-lg">total matches</h3>
                    {stats_matches + stats_draws}
                </div>
                <div class="text-lg">
                    <h3 class="text-text-faded text-md">decisions</h3>
                    {stats_matches}
                </div>
                <div class="text-lg">
                    <h3 class="text-text-faded text-md">draws</h3>
                    {stats_draws}
                </div>
            </div>

            <!-- List Info -->
            <SectionListInfo
                animelistCount={animelist?.length}
                mangalistCount={mangalist?.length}
            />
        </div>

        <!-- Rating Distribution -->
        <SectionRatingDistribution bind:animelist bind:mangalist />
    </div>
</div>
