<script lang="ts">
    import { getAnilistLists, getList } from "$lib/loaders";
    import { type Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";
    import { miscState } from "$lib/settings.svelte";

    let files: FileList | null = $state(null);
    let username = $state("");
    let result: number = $state(0);
    let isLoading: boolean = $state(false);
    let isInputFocused = $state(false);

    onMount(async () => {
        await fetchData();
    });

    async function onFileSelected() {
        if (!files || files.length === 0) return;

        isLoading = true;
        try {
            await getList(files[0]);
            window.location.reload();
        } catch (err: any) {
            alert(`Failed to load list: ${err}`);
        } finally {
            isLoading = false;
        }
    }

    function handleImportClicked(e: MouseEvent) {
        if (result !== 0) {
            const proceed = confirm(
                `This could override your ${miscState.activeList === "animelist" ? "anime" : "manga"} list. Are you sure?`,
            );

            if (!proceed) {
                e.preventDefault();
            }
        }
    }

    async function handleALSubmit() {
        isLoading = true;
        await getAnilistLists(username);
        isLoading = false;
        window.location.reload();
    }

    async function fetchData() {
        try {
            const db: Series[] = await getAllItems(miscState.activeList);
            result = db.length;
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

    $effect(() => {
        const activeList = miscState.activeList; // throwaway state so it reacts properly
        fetchData();
    });
</script>

<div class="flex flex-col items-center justify-center mt-[20vh] gap-4">
    <div class="mb-5">
        <h1 class="text-5xl">alér</h1>
        <p class="text-text-faded mb-2">anime list elo ratings</p>
        <p class="text-lg">A pairwise media rating system.</p>
    </div>

    <div class="flex flex-row gap-2 align-middle items-center mb-4">
        <label
            class="
        cursor-pointer inline-flex items-center justify-center px-4 py-2
        bg-primary text-primary-faded font-medium rounded-full shadow-sm
        transition-colors duration-200"
            tabindex="-1"
        >
            <span>Import List</span>
            {#if isLoading}
                <div class="flex items-center justify-center pl-2">
                    <div
                        class="animate-spin rounded-full h-4 w-4 border-2 border-primary-faded border-t-primary-dimmed"
                    ></div>
                </div>
            {/if}

            <input
                type="file"
                bind:files
                onclick={handleImportClicked}
                onchange={onFileSelected}
                class="sr-only"
            />
        </label>

        <span class="text-text-faded">or</span>
        <form onsubmit={handleALSubmit}>
            <div class="relative">
                <input
                    type="text"
                    bind:value={username}
                    onfocus={() => isInputFocused = true}
                    onblur={() => isInputFocused = false}
                    class="bg-surface border-t-0 border-x-0 border-text-faded w-48 pr-8"
                    placeholder="AniList Username"
                />
                {#if isLoading}
                    <div
                        class="absolute right-1 top-1/2 -translate-y-1/2 flex items-center z-10"
                    >
                        <div
                            class="animate-spin rounded-full h-4 w-4 border-2 border-primary-faded border-t-primary-dimmed"
                        ></div>
                    </div>
                {/if}
                <div
                    class="absolute left-0 right-0 top-full overflow-hidden transition-all duration-300 ease-in-out text-text-faded text-xs text-center pointer-events-none"
                    class:max-h-12={isInputFocused}
                    class:max-h-0={!isInputFocused}
                >
                    Lists over 1000 entries may take a while
                </div>
            </div>
        </form>
    </div>

    <p>
        Supports
        <a
            href="https://myanimelist.net/panel.php?go=export"
            target="_blank"
            class="underline text-primary hover:text-primary-dimmed visited:text-purple-800 dark:visited:text-purple-400"
            >MyAnimeList</a
        >
        and
        <a
            href="https://anilist.co/"
            target="_blank"
            class="underline text-primary hover:text-primary-dimmed visited:text-purple-800 dark:visited:text-purple-400"
            >AniList</a
        >.
    </p>

    {#if result > 0}
        <p class="text-text-faded text-center">
            Currently loaded {result} entries
        </p>
    {/if}
</div>
