<script lang="ts">
    let { title, coverImage, score, userStatus, userScore, mmrRating } =
        $props();
</script>

<div
    class="grid grid-cols-[5rem_1fr] md:grid-cols-[3rem_8fr_8rem_6rem_6rem_8rem] gap-x-4 gap-y-1 p-4 min-h-24 md:h-24 w-full items-center border-b border-text-faded"
>
    <img
        src={coverImage}
        alt={title}
        class="rounded-sm md:rounded-xs shadow-sm shrink-0 h-24 w-18 md:h-16 md:w-12 object-cover row-span-2 md:row-span-1"
    />

    <div
        class="md:truncate wrap-break-word font-medium self-end md:self-center"
    >
        {title}
    </div>

    <div
        class="col-start-2 flex flex-col gap-0.5 md:contents text-left md:text-right text-sm text-text-dim dark:text-text-faded self-start md:self-center"
    >
        <div class="truncate">{userStatus}</div>
        <div class="truncate">Global: {+score / 10}</div>
        <div class="truncate">Yours: {userScore}</div>
        <div class="truncate">Rating: {mmrRating}</div>
    </div>
</div>
