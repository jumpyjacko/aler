import { browser } from "$app/environment";

interface SettingItem {
    key: string;
    title: string;
    description: string;
    checked: boolean;
}

const DEFAULTS: Record<string, boolean> = {
    excludePlanning: true,
    excludeOneshots: false,
    excludeMovies: false
};

function getInitialValue(key: string, defaultValue: boolean): boolean {
    if (!browser) return defaultValue;
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
}

export const settings = $state<SettingItem[]>([
    {
        key: "excludePlanning",
        title: "Exclude 'Plan To Watch/Read' status",
        description: "Excludes series marked as 'Plan to Watch/Read' from being displayed.",
        checked: getInitialValue("excludePlanning", DEFAULTS.excludePlanning)
    },
    {
        key: "excludeOneshots",
        title: "Exclude Oneshots",
        description: "Excludes oneshots from being displayed.",
        checked: getInitialValue("excludeOneshots", DEFAULTS.excludeOneshots)
    },
    {
        key: "excludeMovies",
        title: "Exclude Movies",
        description: "Excludes movies from being displayed.",
        checked: getInitialValue("excludeMovies", DEFAULTS.excludeMovies)
    }
]);

export function initSettings() {
    if (!browser) return;

    settings.forEach(setting => {
        if (localStorage.getItem(setting.key) === null) {
            localStorage.setItem(setting.key, String(setting.checked));
        }
    });
}

if (browser) {
    $effect.root(() => {
        $effect(() => {
            settings.forEach(setting => {
                localStorage.setItem(setting.key, String(setting.checked));
            });
        });
    });
}
