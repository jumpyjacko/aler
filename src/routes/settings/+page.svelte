<script lang="ts">
    import Toggle from "$lib/components/toggle.svelte";
    import { onMount } from "svelte";

    interface SettingItem {
        key: string;
        title: string;
        description: string;
        checked: boolean;
    }

    let settingsList = $state<SettingItem[]>([
        {
            key: "excludePlanning",
            title: "Exclude 'Plan To Watch/Read' status",
            description: "Excludes series marked as 'Plan to Watch/Read' from being displayed.",
            checked: true
        },
        {
            key: "excludeOneshots",
            title: "Exclude Oneshots",
            description: "Excludes oneshots from being displayed.",
            checked: false
        },
        {
            key: "excludeMovies",
            title: "Exclude Movies",
            description: "Excludes movies from being displayed.",
            checked: false
        },
    ]);

    let isLoaded = $state(false);

    onMount(() => {
        settingsList.forEach(setting => {
            const stored = localStorage.getItem(setting.key);
            if (stored !== null) {
                setting.checked = stored === "true";
            }
        });
        isLoaded = true;
    });

    $effect(() => {
        if (!isLoaded) return;
        
        settingsList.forEach(setting => {
            localStorage.setItem(setting.key, String(setting.checked));
        });
    });
</script>

<div class="flex flex-col items-center justify-center mt-50 gap-4">
    <div class="mb-10">
        <h1 class="text-5xl text-text2">Settings</h1>
        <p class="text-text-faded">alér | A pairwise media rating system.</p>
    </div>

    {#if isLoaded}
        <div class="w-full max-w-md space-y-6">
            {#each settingsList as setting, index (setting.key)}
                <div class="flex items-center justify-between gap-8">
                    <div>
                        <h3 class="text-text">{setting.title}</h3>
                        <p class="text-sm text-text-faded">
                            {setting.description}
                        </p>
                    </div>
                    <Toggle
                        bind:checked={settingsList[index].checked}
                        label={setting.title}
                    />
                </div>

                {#if index < settingsList.length - 1}
                    <hr class="border-gray-100" />
                {/if}
            {/each}
        </div>
    {/if}
</div>
