<script lang="ts">
    import { Palette } from "$lib/palette";
    import { UserStatus, type Series } from "$lib/Series";
    import { Chart, DoughnutController, Tooltip, ArcElement } from "chart.js";
    Chart.register(DoughnutController, Tooltip, ArcElement);

    let { list = $bindable() } = $props();

    const statusColors: Record<UserStatus, string> = {
        [UserStatus.Watching]: Palette.GREEN,
        [UserStatus.Reading]: Palette.GREEN,
        [UserStatus.PlanToWatch]: Palette.YELLOW,
        [UserStatus.PlanToRead]: Palette.YELLOW,
        [UserStatus.Completed]: Palette.BLUE,
        [UserStatus.Dropped]: Palette.RED,
        [UserStatus.Paused]: Palette.ORANGE,
    };

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
                        label: "entries",
                        data: dataset,
                        backgroundColor: Object.values(UserStatus).map((s) => statusColors[s]),
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

<div class="flex flex-row lg:flex-row-reverse items-center h-full gap-8">
    <div class="flex flex-col flex-1 gap-1">
        {#each labels as label, i}
            {#if dataset?.[i] ?? 0 !== 0}
            <div class="flex items-center justify-between text-lg">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" style:background={statusColors[label]}></span>
                    <span class="text-text-faded">{label.toLocaleLowerCase()}</span>
                </div>
                <span>{dataset?.[i] ?? 0}</span>
            </div>
            {/if}
        {/each}
    </div>
    <div class="relative w-30 h-30 md:w-40 md:h-40">
        <canvas bind:this={canvasRef}></canvas>
    </div>
</div>
