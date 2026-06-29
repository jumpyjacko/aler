<script lang="ts">
    import DualSlider from "$lib/components/dualSlider.svelte";
    import Toggle from "$lib/components/toggle.svelte";

    import { exclusionSettings, ratingRange } from "$lib/settings.svelte";
    import { formatBytes, getIndexedDBUsage } from "$lib/storage";
    import { clearStore, wipeDatabase } from "$lib/storage/IndexedDB";
    import { onMount } from "svelte";

    let storageEstimate: StorageEstimate | null = $state(null);

    onMount(async () => {
        try {
            storageEstimate = await getIndexedDBUsage();
        } catch (err) {
            console.error("An error occurred:", err);
        }
    });

    async function deleteData() {
        const proceed = confirm(
            "This will delete all data. (Lists, Ratings, Settings)",
        );
        if (!proceed) return;
        await wipeDatabase();
        localStorage.clear();
        window.location.reload();
    }

    async function deleteAL() {
        const proceed = confirm("This will delete your local anime list.");
        if (!proceed) return;
        await clearStore("animelist");
        localStorage.clear();
        window.location.reload();
    }

    async function deleteML() {
        const proceed = confirm("This will delete your local manga list.");
        if (!proceed) return;
        await clearStore("mangalist");
        localStorage.clear();
        window.location.reload();
    }
</script>

<div
    class="flex flex-col items-center justify-center mt-20 md:mt-50 gap-4 mb-20"
>
    <div class="mb-10">
        <h1 class="text-5xl text-text">Settings</h1>
        <p class="text-text-faded">alér | A pairwise media rating system.</p>
    </div>

    <div class="w-full px-4 md:px-0 md:max-w-lg">
        <div class="mb-2">
            <h1 class="text-2xl">Score Range</h1>
            <p class="text-text-faded">
                Limit rating and list to a specific range
            </p>
        </div>

        <div class="flex flex-row justify-center gap-4 text-center w-full">
            <p>{ratingRange.start}</p>
            -
            <p>{ratingRange.end - 1}</p>
        </div>

        <DualSlider
            min={1}
            max={11}
            bind:start={ratingRange.start}
            bind:end={ratingRange.end}
        />
    </div>

    <div class="w-full px-4 md:px-0 md:max-w-lg space-y-3 mt-5">
        <div class="mb-5">
            <h1 class="text-2xl">List Exclusions</h1>
            <p class="text-text-faded">Hide certain media</p>
        </div>
        {#each exclusionSettings as setting, index (setting.key)}
            <div
                class="flex items-center justify-between gap-4"
                title={setting.description}
            >
                <div>
                    <h3 class="text-text">{setting.title}</h3>
                </div>
                <Toggle
                    bind:checked={exclusionSettings[index].checked}
                    label={setting.title}
                />
            </div>

            {#if index < exclusionSettings.length - 1}
                <hr class="border-text-faded" />
            {/if}
        {/each}
    </div>

    <div class="w-full px-4 md:px-0 md:max-w-lg space-y-3 mt-5 items">
        <div class="mb-5">
            <h1 class="text-2xl">Data and Storage</h1>
            <p class="text-text-faded">Manage your locally stored data</p>
        </div>
        {#if storageEstimate && storageEstimate.usage && storageEstimate.quota}
            <div>Used <span class="cursor-help" title="Can be inaccurate on Firefox and Safari">{formatBytes(storageEstimate.usage)}</span> of available storage ({formatBytes(storageEstimate.quota)})</div>
        {/if}
        <div class="flex flex-row justify-center gap-2">
            <button
                onclick={deleteAL}
                class="px-4 py-2 rounded-full bg-primary text-primary-faded hover:bg-secondary-dimmed hover:text-secondary shadow-sm transition-colors duration-100"
                >Delete Anime List</button
            >
            <button
                onclick={deleteML}
                class="px-4 py-2 rounded-full bg-primary text-primary-faded hover:bg-secondary-dimmed hover:text-secondary shadow-sm transition-colors duration-100"
                >Delete Manga List</button
            >
            <button
                onclick={deleteData}
                class="px-4 py-2 rounded-full bg-primary-faded text-primary-dimmed hover:bg-secondary hover:text-secondary-dimmed shadow-sm transition-colors duration-100"
                >Delete ALL Data</button
            >
        </div>
    </div>
</div>
