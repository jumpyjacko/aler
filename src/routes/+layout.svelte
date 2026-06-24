<script lang="ts">
    import "./layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import { resolve } from "$app/paths";
    import { onMount } from "svelte";
    import type { Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { globalState } from "./globalState.svelte";

    import DarkmodeToggle from "./darkmodeToggle.svelte";

    let { children } = $props();

    let selected: number = $state(0);
    let animelistLength: number = $state(0);
    let mangalistLength: number = $state(0);

    onMount(async () => {
        const animeDB: Series[] = await getAllItems("animelist");
        animelistLength = animeDB.length;
        const mangaDB: Series[] = await getAllItems("mangalist");
        mangalistLength = mangaDB.length;

        if (globalState.activeList === "animelist") {
            selected = 0;
        } else {
            selected = 1;
        }
    });

    function handleDatabaseSelection(list: string) {
        selected = list === "animelist" ? 0 : 1; // TODO: make this better
        globalState.activeList = list;
    }
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav
    class="sticky left-0 top-0 w-full flex flex-col md:flex-row px-8 py-2 justify-between bg-surface border-b border-text-faded transition-colors duration-100"
>
    <div class="flex flex-row gap-4 items-center">
        <a href={resolve("/")} class="font-bold">alér</a>

        {#if animelistLength > 0 || mangalistLength > 0}
            <span class="text-text-dim">|</span>
        {/if}

        {#if animelistLength > 0}
            <button
                onclick={() => handleDatabaseSelection("animelist")}
                class="cursor-pointer transition-all {selected === 0
                    ? 'border-b border-text font-medium'
                    : 'text-text-faded'}"
            >
                anime
            </button>
        {/if}
        {#if mangalistLength > 0}
            <button
                onclick={() => handleDatabaseSelection("mangalist")}
                class="cursor-pointer transition-all {selected === 1
                    ? 'border-b border-text font-medium'
                    : 'text-text-faded'}"
            >
                manga
            </button>
        {/if}
    </div>

    <div class="flex flex-row mt-3 md:mt-0 gap-4 items-center">
        <a href={resolve("/")} class="text-text-dim hover:text-text">Home</a>
        <a href={resolve("/rating")} class="text-text-dim hover:text-text"
            >Rating</a
        >
        <a href={resolve("/leaderboard")} class="text-text-dim hover:text-text"
            >Leaderboard</a
        >
        <a href={resolve("/statistics")} class="text-text-dim hover:text-text"
            >Stats</a
        >

        <DarkmodeToggle />
    </div>
</nav>

{@render children()}
