<script lang="ts">
    import { onMount } from "svelte";
    import { binomial } from "$lib/distribute";
    import {
        Chart,
        BarController,
        LinearScale,
        CategoryScale,
        BarElement,
    } from "chart.js";
    Chart.register(BarController, LinearScale, CategoryScale, BarElement);

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
                scales: { y: { beginAtZero: true } },
            },
        });

        Chart.defaults.backgroundColor = getComputedStyle(
            document.documentElement,
        )
            .getPropertyValue("--color-primary")
            .trim();

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

<div>
    <input type="range" bind:value={count} min="0" max="1000" />
    <input type="range" bind:value={p} min="0" max="1" step="0.01" />
    <input type="range" bind:value={flatness} min="0.01" max="10" step="0.01" />
</div>

<div class="relative w-screen h-[50vh]">
    <canvas bind:this={canvasRef}></canvas>
</div>

<div>
    {distribution}
</div>
