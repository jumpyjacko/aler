<script lang="ts">
    import { onMount, untrack } from "svelte";
    import { binomial } from "$lib/distribute";
    import { getFilteredList } from "$lib/storage";
    import { miscState } from "$lib/settings.svelte";
    import type { Series } from "$lib/Series";
    import {
        Chart,
        BarController,
        LinearScale,
        CategoryScale,
        BarElement,
        Tooltip,
    } from "chart.js";
    import { putItem } from "$lib/storage/IndexedDB";
    Chart.register(
        BarController,
        LinearScale,
        CategoryScale,
        BarElement,
        Tooltip,
    );

    let seriesList: Series[] | null = $state(null);

    let count = $state(0);
    let p = $state(0.49);
    let flatness = $state(1);

    let distribution = $state<number[]>([]);
    let currentDistribution = $derived.by(() => {
        if (!seriesList) return new Array(10).fill(0);
        const counts = new Array(10).fill(0);
        for (const s of seriesList) {
            const score = s.userScore;
            if (score >= 1 && score <= 10) {
                counts[score - 1]++;
            }
        }
        return counts;
    });

    let currentDistRef: HTMLCanvasElement | undefined;
    let cdChart: Chart | undefined;
    let desiredDistRef: HTMLCanvasElement | undefined;
    let ddChart: Chart | undefined;

    onMount(() => {
        fetchData().then(() => {
            if (!seriesList || !desiredDistRef || !currentDistRef) return;

            count = seriesList.length;
            distribution = binomial(count, 10, p, flatness);

            const ddData = $state.snapshot(distribution);
            const cdData = currentDistribution;
            const color = getComputedStyle(document.documentElement)
                .getPropertyValue("--color-primary")
                .trim();

            cdChart = new Chart(currentDistRef, {
                type: "bar",
                data: {
                    labels: cdData.map((_, i) => String(i + 1)),
                    datasets: [
                        {
                            label: "Items",
                            data: cdData,
                            backgroundColor: color,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, reverse: true } },
                    indexAxis: "y",
                },
            });

            ddChart = new Chart(desiredDistRef, {
                type: "bar",
                data: {
                    labels: ddData.map((_, i) => String(i + 1)),
                    datasets: [
                        {
                            label: "Items",
                            data: ddData,
                            backgroundColor: color,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, reverse: true } },
                    indexAxis: "y",
                },
            });
        });

        return () => {
            cdChart?.destroy();
            ddChart?.destroy();
        };
    });

    $effect(() => {
        distribution = binomial(count, 10, p, flatness);

        untrack(() => {
            if (!ddChart) return;
            const data = $state.snapshot(distribution);

            ddChart.data.datasets[0].data = data;
            ddChart.update();
        });
    });

    $effect(() => {
        if (!cdChart || !seriesList) return;
        const data = currentDistribution;
        cdChart.data.datasets[0].data = data;
        cdChart.update();
    });

    async function fetchData() {
        try {
            seriesList = await getFilteredList();
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    }

    $effect(() => {
        const activeList = miscState.activeList;
        fetchData().then(() => {
            untrack(() => {
                if (!cdChart || !ddChart || !seriesList) return;

                count = seriesList.length;
                cdChart.data.datasets[0].data = [...currentDistribution];
                cdChart.update();

                ddChart.data.datasets[0].data = binomial(
                    count,
                    10,
                    p,
                    flatness,
                );
                ddChart.update();
            });
        });
    });

    async function applyDistribution() {
        if (!seriesList) return;

        let workingList = $state.snapshot(seriesList).reverse();
        let index = 0;
        for (
            let bucketIndex = 0;
            bucketIndex < distribution.length;
            bucketIndex++
        ) {
            const currentBucketSize = distribution[bucketIndex];

            for (let i = 0; i < currentBucketSize; i++) {
                if (index >= seriesList.length) return;

                workingList[index].recommendedScore = bucketIndex + 1;
                await putItem(miscState.activeList, workingList[index]);
                index++;
            }
        }
    }
</script>

<div class="flex flex-col md:flex-row justify-around">
    <div class="m-4 w-[40vw]">
        <h3>Current Distribution</h3>
        <div class="relative w-[40vw] h-[50vh] m-2">
            <canvas bind:this={currentDistRef}></canvas>
        </div>
    </div>

    <div class="m-4 md:w-[40vw]">
        <h3>Desired Distribution</h3>
        <div class="flex flex-row">
            <div class="relative w-screen md:w-[40vw] h-[50vh] m-2">
                <canvas bind:this={desiredDistRef}></canvas>
            </div>
            <input
                type="range"
                bind:value={p}
                min="0"
                max="1"
                step="0.01"
                class="slider"
                orient="vertical"
            />
        </div>
        <input
            type="range"
            bind:value={flatness}
            min="0.01"
            max="10"
            step="0.01"
            class="slider px-3 w-full"
        />
    </div>
</div>

<div class="flex w-full justify-center">
    <button
        onclick={applyDistribution}
        class="px-4 py-2 rounded-full bg-primary text-primary-faded shadow-sm cursor-pointer transition-colors duration-100"
        >Apply Distribution</button
    >
</div>

<style>
    input[type="range"].slider {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
    }

    input[type="range"].slider::-webkit-slider-runnable-track {
        height: 8px;
        border-radius: 3px;
        background: var(--color-primary-faded);
    }

    input[type="range"][orient="vertical"].slider::-moz-range-track {
        width: 8px;
        height: 100%;
        border-radius: 3px;
        background: var(--color-primary-faded);
    }

    input[type="range"].slider::-moz-range-track {
        height: 8px;
        border-radius: 3px;
        background: var(--color-primary-faded);
    }

    input[type="range"].slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 8px;
        background: var(--color-primary);
        border-radius: calc(infinity * 1px);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type="range"][orient="vertical"].slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 8px;
        height: 18px;
        background: var(--color-primary);
        border-radius: calc(infinity * 1px);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type="range"].slider::-moz-range-thumb {
        width: 8px;
        height: 18px;
        border: none;
        border-radius: calc(infinity * 1px);
        background: var(--color-primary);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type="range"][orient="vertical"].slider::-moz-range-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 8px;
        background: var(--color-primary);
        border: none;
        border-radius: calc(infinity * 1px);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type="range"][orient="vertical"] {
        writing-mode: vertical-lr;
        direction: rtl;
    }
</style>
