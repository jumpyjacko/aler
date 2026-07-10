<script lang="ts">
    import type { Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";
    import SectionListInfo from "./section_ListInfo.svelte";
    import SectionRatingDistribution from "./section_RatingDistribution.svelte";
    import { getFilteredList } from "$lib/storage";
    import { miscState } from "$lib/settings.svelte";

    let animelist: Series[] | null = $state(null);
    let mangalist: Series[] | null = $state(null);
    let filteredlist: Series[] | null = $state(null);

    let stats_matches: number = $state(0);
    let stats_draws: number = $state(0);

    let loading: boolean = $state(true);

    onMount(async () => {
        fetchData();
    });

    $effect(() => {
        const throwaway = miscState.activeList;
        getFilteredList().then((v) => {
            filteredlist = v;
        });
    });

    async function fetchData() {
        try {
            animelist = await getAllItems("animelist");
            mangalist = await getAllItems("mangalist");
            filteredlist = await getFilteredList();

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
    <div class="flex flex-col gap-4">
        <div
            class="flex flex-col w-full gap-4 md:flex-row md:justify-around md:gap-8"
        >
            <!-- Match Stats -->
            <div class="flex flex-col p-4 flex-1">
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

            <div
                class="hidden md:inline h-32 w-px bg-text-faded self-center"
            ></div>

            <!-- List Info -->

            <div
                class="px-4 flex-2"
            >
                <SectionListInfo
                    animelistCount={animelist?.length}
                    mangalistCount={mangalist?.length}
                />
            </div>

            <div
                class="hidden md:inline h-32 w-px bg-text-faded self-center"
            ></div>

            <div class="flex flex-col justify-center p-4 flex-1">
                <div class="text-2xl">
                    <h3 class="text-text-faded text-lg">currently filtering</h3>
                    {(miscState.activeList === "animelist"
                        ? animelist?.length
                        : mangalist?.length) - filteredlist?.length} of {miscState.activeList ===
                    "animelist"
                        ? animelist?.length
                        : mangalist?.length}
                </div>
                <div class="text-lg">
                    <h3 class="text-text-faded text-md">total filtered list</h3>
                    {filteredlist?.length}
                </div>
            </div>
        </div>

        <!-- Rating Distribution -->
        <SectionRatingDistribution bind:animelist bind:mangalist />
    </div>
</div>
