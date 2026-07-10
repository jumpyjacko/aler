<script lang="ts">
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
        const step = 200;
        const max = Math.max(...list.map((s) => s.mmrRating), 0);
        const count = Math.ceil((max + 1) / step);
        const data = new Array(count).fill(0);
        for (const s of list) {
            const i = Math.floor(s.mmrRating / step);
            if (i >= 0 && i < count) data[i]++;
        }
        const labels = Array.from({ length: count }, (_, i) => {
            const start = i * step;
            const end = start + step;
            return `${start}-${end}`;
        });
        return { data, labels };
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
                labels: anime_dataset.labels,
                datasets: [
                    {
                        label: "Anime",
                        data: anime_dataset.data,
                        backgroundColor: "#3b87ca",
                    },
                    {
                        label: "Manga",
                        data: manga_dataset.data,
                        backgroundColor: "#ca506e",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true } },
                plugins: {
                    legend: { display: true, position: 'right'},
                },
            },
        });

        return () => {
            chart?.destroy();
        };
    });
</script>

<div class="relative h-80 mx-8">
    <canvas bind:this={canvasRef}></canvas>
</div>
