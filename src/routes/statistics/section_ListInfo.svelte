<script lang="ts">
    import { Palette } from "$lib/palette";
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
                        label: "entries",
                        data: [animelistCount, mangalistCount],
                        backgroundColor: [Palette.BLUE, Palette.RED],
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

<div class="flex flex-row items-center h-full gap-8">
    <div class="flex flex-col flex-1">
        <div class="text-2xl">
            <h3 class="text-text-faded text-lg flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" style:background={Palette.BLUE}></span>
                anime list entries
            </h3>
            {animelistCount}
        </div>
        <div class="text-2xl">
            <h3 class="text-text-faded text-lg flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" style:background={Palette.RED}></span>
                manga list entries
            </h3>
            {mangalistCount}
        </div>
    </div>
    <div class="relative w-40 h-40">
        <canvas bind:this={canvasRef}></canvas>
    </div>
</div>
