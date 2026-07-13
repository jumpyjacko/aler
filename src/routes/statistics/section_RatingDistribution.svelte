<script lang="ts">
    import { Palette } from "$lib/palette";
    import type { Series } from "$lib/Series";
    import {
        Chart,
        BarController,
        BarElement,
        LinearScale,
        CategoryScale,
        Tooltip,
        Legend,
    } from "chart.js";
    Chart.register(
        BarController,
        BarElement,
        LinearScale,
        CategoryScale,
        Tooltip,
        Legend,
    );

    let { animelist = $bindable(), mangalist = $bindable() } = $props();

    function buildBuckets(list: Series[] | null) {
        const empty = { labels: [] as string[], data: [] as number[] };
        if (!list) return empty;
        const step = 100;
        const max = Math.max(...list.map((s) => s.mmrRating), 0);
        const count = Math.ceil((max + 1) / step);
        const data = new Array(count).fill(0);
        for (const s of list) {
            const i = Math.floor(s.mmrRating / step);
            if (i >= 0 && i < count) data[i]++;
        }

        const first = data.findIndex((v) => v > 0);
        if (first === -1) return empty;

        const trimmed = data.slice(first);
        const labels = Array.from({ length: trimmed.length }, (_, i) => {
            const start = (first + i) * step;
            const end = start + step;
            return `${start} - ${end}`;
        });
        return { data: trimmed, labels };
    }

    let anime_dataset = $derived.by(() => buildBuckets(animelist));
    let manga_dataset = $derived.by(() => buildBuckets(mangalist));

    let canvasRef: HTMLCanvasElement | undefined;
    let chart: Chart | undefined;

    $effect(() => {
        if (!canvasRef) return;
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(canvasRef, {
            type: "bar",
            data: {
                labels:
                    anime_dataset.data.length > manga_dataset.data.length
                        ? anime_dataset.labels
                        : manga_dataset.labels,
                datasets: [
                    {
                        label: "anime",
                        data: anime_dataset.data,
                        backgroundColor: Palette.BLUE,
                    },
                    {
                        label: "manga",
                        data: manga_dataset.data,
                        backgroundColor: Palette.RED,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true } },
                plugins: {
                    legend: { display: true, position: 'bottom' },
                },
            },
        });

        return () => {
            chart?.destroy();
        };
    });
</script>

<div class="flex flex-col">
    <h2 class="text-xl text-text-faded text-center">rating distribution</h2>
    <div class="relative h-80 mx-8">
        <canvas bind:this={canvasRef}></canvas>
    </div>
</div>
