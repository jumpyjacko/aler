<script lang="ts">
    import "./layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import { resolve } from "$app/paths";
    import { onMount } from "svelte";
    import type { Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";

    let { children } = $props();

    let selected: number = $state(0);

    let animelistLength: number = $state(0);
    let mangalistLength: number = $state(0);

    onMount(async () => {
        const animeDB: Series[] = await getAllItems("animelist");
        animelistLength = animeDB.length;
        const mangaDB: Series[] = await getAllItems("mangalist");
        mangalistLength = mangaDB.length;

        const activeList = localStorage.getItem("activeList");
        if (activeList === "mangalist") {
            selected = 1;
        } else {
            selected = 0;
        }
    });

    function handleDatabaseSelection(index: number) {
        selected = index; // Update the selected state
        let list = index === 0 ? "animelist" : "mangalist";
        localStorage.setItem("activeList", list);
    }
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav
    class="sticky left-0 top-0 w-full flex flex-row px-8 py-2 justify-between bg-white border-b border-gray-200"
>
    <div class="flex flex-row gap-4 items-center">
        <a href={resolve("/")} class="font-bold">alér</a>

        {#if animelistLength > 0 || mangalistLength > 0}
            <span class="text-gray-300">|</span>
        {/if}

        {#if animelistLength > 0}
            <button
                onclick={() => handleDatabaseSelection(0)}
                class="cursor-pointer transition-all {selected === 0
                    ? 'text-black border-b border-black font-medium'
                    : 'text-gray-400'}"
            >
                anime
            </button>
        {/if}
        {#if mangalistLength > 0}
            <button
                onclick={() => handleDatabaseSelection(1)}
                class="cursor-pointer transition-all {selected === 1
                    ? 'text-black  border-b border-black font-medium'
                    : 'text-gray-400'}"
            >
                manga
            </button>
        {/if}
    </div>

    <div class="flex flex-row gap-4 items-center">
        <a href={resolve("/")} class="text-gray-600 hover:text-black">Home</a>
        <a href={resolve("/rating")} class="text-gray-600 hover:text-black"
            >Rating</a
        >
        <a href={resolve("/leaderboard")} class="text-gray-600 hover:text-black"
            >Leaderboard</a
        >
        <a href={resolve("/statistics")} class="text-gray-600 hover:text-black"
            >Stats</a
        >
    </div>
</nav>

{@render children()}
