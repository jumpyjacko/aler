<script lang="ts">
    import { getList } from "$lib/loaders/loader";
    import { type Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    let files: FileList | null = $state(null);
    let result: number = $state(0);
    let isLoading: boolean = $state(false);

    onMount(async () => {
        const db: Series[] = await getAllItems("list");
        result = db.length;
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
</script>

<div class="flex flex-col items-center justify-center mt-50 gap-4">
    <h1 class="text-2xl">Anime List Elo Ranker (or Rebalancer)</h1>

    <label
        class="
        cursor-pointer inline-flex items-center justify-center px-4 py-2
        bg-blue-400 text-white font-medium rounded-full shadow-sm
        transition-colors duration-200"
    >
        <span>Load list</span>
        {#if isLoading}
            <div class="flex items-center justify-center pl-2">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-white"></div>
            </div>
        {/if}
            
        <input
            type="file"
            bind:files
            onchange={onFileSelected}
            class="sr-only"
        />
    </label>

    {#if result > 0 }
        <p class="italic text-gray-500">
        Currently loaded {result} entries
        </p>
    {/if}
</div>
