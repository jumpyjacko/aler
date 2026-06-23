<script lang="ts">
    import { getList } from "$lib/loaders/loader";
    import { type Series } from "$lib/Series";
    import { getAllItems } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    let files: FileList | null = $state(null);
    let result: Series[] | null = $state(null);

    onMount(async () => {
        const db: Series[] = await getAllItems("list");
        if (db.length === 0) return;
        result = db;
    });

    async function onFileSelected() {
        if (!files || files.length === 0) return;

        try {
            result = await getList(files[0]);
        } catch (err: any) {
            alert(`Failed to load list: ${err}`);
        }
    }

    $inspect(result);
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
        <input
            type="file"
            bind:files
            onchange={onFileSelected}
            class="sr-only"
        />
    </label>
</div>
