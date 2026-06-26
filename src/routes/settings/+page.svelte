<script lang="ts">
    import Toggle from "$lib/components/toggle.svelte";
    import { exclusionSettings } from "$lib/settings.svelte";
</script>

<div class="flex flex-col items-center justify-center mt-50 gap-4">
    <div class="mb-10">
        <h1 class="text-5xl text-text">Settings</h1>
        <p class="text-text-faded">alér | A pairwise media rating system.</p>
    </div>

    <div class="w-full px-4 md:px-0 md:max-w-lg space-y-3">
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
</div>
