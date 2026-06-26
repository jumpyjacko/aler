import { browser } from "$app/environment";

interface SettingItem {
    key: string;
    title: string;
    description: string;
    checked: boolean;
}

const DEFAULTS: Record<string, boolean> = {
    excludePlanning: true,
    excludeDropped: false,
    excludeOneshots: false,
    excludeMovies: false
};

function getInitialValue(key: string, defaultValue: boolean): boolean {
    if (!browser) return defaultValue;
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
}

export const exclusionSettings = $state<SettingItem[]>([
    {
        key: "excludePlanning",
        title: "Exclude 'Plan To Watch/Read' status",
        description: "Excludes series marked as 'Plan to Watch/Read' from being displayed.",
        checked: getInitialValue("excludePlanning", DEFAULTS.excludePlanning)
    },
    {
        key: "excludeDropped",
        title: "Exclude 'Dropped' status",
        description: "Excludes series marked as 'Dropped' from being displayed.",
        checked: getInitialValue("excludeDropped", DEFAULTS.excludeDropped)
    },
    {
        key: "excludeOneshots",
        title: "Exclude Oneshots",
        description: "Excludes oneshots (where the user only has one chapter read) from being displayed.",
        checked: getInitialValue("excludeOneshots", DEFAULTS.excludeOneshots)
    },
    {
        key: "excludeMovies",
        title: "Exclude Movies",
        description: "Excludes movies from being displayed.",
        checked: getInitialValue("excludeMovies", DEFAULTS.excludeMovies)
    },
]);

export let miscState = $state({
    activeList: "animelist",
});

export function initSettings() {
    if (!browser) return;

    exclusionSettings.forEach(setting => {
        if (localStorage.getItem(setting.key) === null) {
            localStorage.setItem(setting.key, String(setting.checked));
        }
    });
}

if (browser) {
    $effect.root(() => {
        $effect(() => {
            exclusionSettings.forEach(setting => {
                localStorage.setItem(setting.key, String(setting.checked));
            });
        });
    });
}
