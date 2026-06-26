<script lang="ts">
    let {
        min = 1,
        max = 10,
        start = $bindable(1),
        end = $bindable(10),
        minGap = 1,
    } = $props();

    let startPercent = $derived(((start - min) / (max - min)) * 100);
    let endPercent = $derived(((end - min) / (max - min)) * 100);

    function handleStart() {
        start = Math.min(start, end - minGap);
    }

    function handleEnd() {
        end = Math.max(end, start + minGap);
    }
</script>

<div class="slider-container">
    <div
        class="slider-track"
        style:background="linear-gradient(to right, var(--color-primary-faded){startPercent}%,
        var(--color-primary) {startPercent}%, var(--color-primary) {endPercent}%,
        var(--color-primary-faded) {endPercent}%)"
    ></div>

    <input
        type="range"
        {min}
        {max}
        bind:value={start}
        oninput={handleStart}
        class="thumb"
        style:z-index={start > max ? 5 : 3}
    />

    <input
        type="range"
        {min}
        {max}
        bind:value={end}
        oninput={handleEnd}
        class="thumb"
        style:z-index={4}
    />
</div>

<style>
    .slider-container {
        position: relative;
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
    }

    .slider-track {
        position: absolute;
        width: 100%;
        height: 6px;
        border-radius: 3px;
        pointer-events: none;
    }

    .thumb {
        position: absolute;
        width: 100%;
        height: 0;
        margin: 0;
        background: none;
        pointer-events: none;
        -webkit-appearance: none;
        appearance: none;
    }

    .thumb::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 8px;
        height: 18px;
        background: #ffffff;

        border-radius: calc(infinity * 1px);
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .thumb::-moz-range-thumb {
        width: 8px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
        border-radius: calc(infinity * 1px);
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
</style>
