<script lang="ts">
    import Toggle from "$lib/components/toggle.svelte";
    import { settings } from "$lib/settings.svelte";
</script>

<div class="flex flex-col items-center justify-center mt-50 gap-4">
    <div class="mb-10">
        <h1 class="text-5xl text-text">Settings</h1>
        <p class="text-text-faded">alér | A pairwise media rating system.</p>
    </div>

    <div class="w-full px-4 md:px-0 md:max-w-lg space-y-6">
        {#each settings as setting, index (setting.key)}
            <div class="flex items-center justify-between gap-8">
                <div>
                    <h3 class="text-text">{setting.title}</h3>
                    <p class="text-sm text-text-faded">
                        {setting.description}
                    </p>
                </div>
                <Toggle
                    bind:checked={settings[index].checked}
                    label={setting.title}
                />
            </div>

            {#if index < settings.length - 1}
                <hr class="border-text-faded" />
            {/if}
        {/each}
    </div>
</div>
