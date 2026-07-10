<script lang="ts">
    import { Chart, DoughnutController, Tooltip, ArcElement } from "chart.js";
    Chart.register(DoughnutController, Tooltip, ArcElement);

    let { animelistCount = 0, mangalistCount = 0 } = $props();

    let canvasRef: HTMLCanvasElement | undefined;
    let chart: Chart | undefined;

    $effect(() => {
        if (!canvasRef) return;
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(canvasRef, {
            type: "doughnut",
            data: {
                labels: ["anime", "manga"],
                datasets: [
                    {
                        label: "Items",
                        data: [animelistCount, mangalistCount],
                        backgroundColor: ["#3b87ca", "#ca506e"],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                },
            },
        });

        return () => {
            chart?.destroy();
        };
    });
</script>

<div class="flex flex-row align-middle items-center gap-8">
    <div class="flex flex-col p-4 flex-1">
        <div class="text-2xl">
            <h3 class="text-text-faded text-lg">anime list entries</h3>
            {animelistCount}
        </div>
        <div class="text-2xl">
            <h3 class="text-text-faded text-lg">manga list entries</h3>
            {mangalistCount}
        </div>
    </div>
    <div class="relative w-40 h-40">
        <canvas bind:this={canvasRef}></canvas>
    </div>
</div>
