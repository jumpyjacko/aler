<script lang="ts">
    let { checked = $bindable(false), label = "Toggle setting" } = $props();
</script>

<button
    type="button"
    aria-label={label}
    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-100 ease-in-out focus:outline-none {checked
        ? 'bg-primary'
        : 'bg-primary-faded'}"
    onclick={() => (checked = !checked)}
>
    <span
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-faded dark:bg-primary-dimmed shadow ring-0 transition duration-200 ease-in-out {checked
            ? 'translate-x-5'
            : 'translate-x-0'}"
    ></span>
</button>
