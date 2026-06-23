<script lang="ts">
    let { title, coverImage, status, rating, userStatus, userRating } =
        $props();
</script>

<div
    class="grid grid-cols-[3rem_1fr] md:grid-cols-[3rem_8fr_8rem_6rem_6rem] gap-x-4 gap-y-1 p-4 min-h-24 md:h-24 w-full items-center border-b border-gray-100"
>
    <img
        src={coverImage}
        alt={title}
        class="rounded-md shadow-sm shrink-0 h-16 w-12 object-cover row-span-2 md:row-span-1"
    />

    <div
        class="md:truncate wrap-break-word font-medium self-end md:self-center"
    >
        {title}
    </div>

    <div
        class="col-start-2 flex flex-col gap-0.5 md:contents text-left md:text-right text-sm text-gray-600 self-start md:self-center"
    >
        <div class="truncate">{userStatus}</div>
        <div class="truncate">Global: {+rating / 10}</div>
        <div class="truncate">Yours: {userRating}</div>
    </div>
</div>
