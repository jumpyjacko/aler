<script lang="ts">
    import { onMount } from "svelte";
    import { binomial } from "$lib/distribute";
    import {
        Chart,
        BarController,
        LinearScale,
        CategoryScale,
        BarElement,
        Tooltip,
    } from "chart.js";
    Chart.register(
        BarController,
        LinearScale,
        CategoryScale,
        BarElement,
        Tooltip,
    );

    let count = $state(1000);
    let p = $state(0.45);
    let flatness = $state(1);

    let distribution = $state<number[]>([]);

    $effect(() => {
        distribution = binomial(count, 10, p, flatness);
    });

    let canvasRef: HTMLCanvasElement | undefined;
    let chart: Chart | undefined;

    onMount(() => {
        if (!canvasRef) return;
        const data = $state.snapshot(distribution);

        chart = new Chart(canvasRef, {
            type: "bar",
            data: {
                labels: data.map((_, i) => String(i + 1)),
                datasets: [{ label: "Items", data }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, reverse: true } },
                indexAxis: "y",
                backgroundColor: getComputedStyle(document.documentElement)
                    .getPropertyValue("--color-primary")
                    .trim(),
            },
        });

        return () => chart?.destroy();
    });

    $effect(() => {
        if (!chart) return;
        const data = distribution.slice();
        chart.data.labels = data.map((_, i) => String(i));
        chart.data.datasets[0].data = data;
        chart.update();
    });
</script>

<div>
    this will be a stats dashboard where the user can see their beautiful normal
    distribution of scores
</div>

<div class="m-4">
    <div class="flex flex-row">
        <div class="relative w-[50vw] h-[50vh] m-2">
            <canvas bind:this={canvasRef}></canvas>
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
    <input type="range" bind:value={flatness} min="0.01" max="10" step="0.01" class="slider w-[50vw]" />
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
        background: #ffffff;
        border-radius: calc(infinity * 1px);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type="range"][orient="vertical"].slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 8px;
        height: 18px;
        background: #ffffff;
        border-radius: calc(infinity * 1px);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type="range"].slider::-moz-range-thumb {
        width: 8px;
        height: 18px;
        border: none;
        border-radius: calc(infinity * 1px);
        background: #ffffff;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type="range"][orient="vertical"].slider::-moz-range-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 8px;
        background: #ffffff;
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
