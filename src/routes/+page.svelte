<script lang="ts">
    import { getParsedData } from "$lib/loaders/loader";
    import { UserStatus, type Series } from "$lib/Series";

    import SeriesCard from "./seriesCard.svelte";

    let files: FileList | null = $state(null);
    let result: Series[] | null = $state(null);

    async function onFileSelected() {
        if (!files || files.length === 0) return;

        try {
            result = await getParsedData(files[0]);
        } catch (err: any) {
            alert(`Failed to load list: ${err}`);
        }
    }

    $inspect(result);
</script>

<div class="flex flex-col items-center justify-center mt-50 gap-4">
    <h1 class="text-xl">aler</h1>

    <label
        class="
        cursor-pointer inline-flex items-center justify-center px-4 py-2
        bg-blue-400 text-white font-medium rounded-lg shadow-sm
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

{#if result}
    <div class="flex justify-center w-full">
        <div class="flex flex-wrap justify-center max-w-full">
            {#each result as series}
                <SeriesCard {...series} />
            {/each}
        </div>
    </div>
{/if}
