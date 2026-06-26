<script lang="ts">
    import DualSlider from "$lib/components/dualSlider.svelte";
    import Toggle from "$lib/components/toggle.svelte";

    import { exclusionSettings, ratingRange } from "$lib/settings.svelte";
</script>

<div class="flex flex-col items-center justify-center mt-20 md:mt-50 gap-4 mb-20">
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
