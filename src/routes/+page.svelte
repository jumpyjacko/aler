<script lang="ts">
    import { getList } from "$lib/loaders";
    import { type Series } from "$lib/Series";
    import { clearStore, getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";
    import { globalState } from "./globalState.svelte";

    let files: FileList | null = $state(null);
    let result: number = $state(0);
    let isLoading: boolean = $state(false);

    onMount(async () => {
        await fetchData();
    });

    async function onFileSelected() {
        if (!files || files.length === 0) return;

        isLoading = true;
        try {
            const list = await getList(files[0]);
            result = list.length;
        } catch (err: any) {
            alert(`Failed to load list: ${err}`);
        } finally {
            isLoading = false;
        }
    }

    async function deleteData() {
        await clearStore("animelist"); // TODO: replace with function that wipes entire db
        await clearStore("mangalist");
        const db: Series[] = await getAllItems(globalState.activeList);
        result = db.length;
    }

    async function fetchData() {
        try {
            const db: Series[] = await getAllItems(globalState.activeList);
            result = db.length;
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

    $effect(() => {
        const activeList = globalState.activeList; // throwaway state so it reacts properly
        fetchData();
    });
</script>

<div class="flex flex-col items-center justify-center mt-50 gap-4">
    <div class="mb-5">
        <h1 class="text-5xl">alér</h1>
        <p class="text-gray-400 mb-2">anime list elo ratings</p>
        <p class="text-lg">A pairwise media rating system.</p>
    </div>

    <div class="flex flex-row gap-2">
        <label
            class="
        cursor-pointer inline-flex items-center justify-center px-4 py-2
        bg-blue-400 text-white font-medium rounded-full shadow-sm
        transition-colors duration-200"
        >
            <span>Import list</span>
            {#if isLoading}
                <div class="flex items-center justify-center pl-2">
                    <div
                        class="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-white"
                    ></div>
                </div>
            {/if}

            <input
                type="file"
                bind:files
                onchange={onFileSelected}
                class="sr-only"
            />
        </label>

        <button
            onclick={deleteData}
            class="px-4 py-2 rounded-full bg-blue-200 text-blue-500"
            >Delete ALL Data</button
        >
    </div>

    <p>
        Supports
        <a
            href="https://myanimelist.net/panel.php?go=export"
            target="_blank"
            class="underline text-blue-600 hover:text-blue-800 visited:text-purple-900"
            >MyAnimeList</a
        >
        and <span class="line-through">AniList</span>.
    </p>

    {#if result > 0}
        <p class="text-gray-500 text-center">
            Currently loaded {result} entries
        </p>
    {/if}
</div>
