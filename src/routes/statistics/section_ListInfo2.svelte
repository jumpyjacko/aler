<script lang="ts">
    import { Palette } from "$lib/palette";
    import { UserStatus, type Series } from "$lib/Series";
    import { Chart, DoughnutController, Tooltip, ArcElement } from "chart.js";
    Chart.register(DoughnutController, Tooltip, ArcElement);

    let { list = $bindable() } = $props();

    let labels = $derived.by(() => Object.values(UserStatus));
    let dataset = $derived.by(() => {
        if (!list) return;
        const grouped = Object.groupBy(
            list,
            (entry: Series) => entry.userStatus,
        );
        return Object.values(UserStatus).map(
            (status) => grouped[status]?.length || 0,
        );
    });

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
                labels: labels,
                datasets: [
                    {
                        label: "Items",
                        data: dataset,
                        backgroundColor: [
                            Palette.GREEN,
                            Palette.GREEN,
                            Palette.YELLOW,
                            Palette.YELLOW,
                            Palette.BLUE,
                            Palette.RED,
                            Palette.ORANGE,
                        ],
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

<div class="flex flex-row md:flex-row-reverse items-center h-full gap-8">
    <div class="flex flex-col flex-1">
        <div class="text-2xl">
            <h3 class="text-text-faded text-lg">placeholder</h3>
            number
        </div>
    </div>
    <div class="relative w-40 h-40">
        <canvas bind:this={canvasRef}></canvas>
    </div>
</div>
