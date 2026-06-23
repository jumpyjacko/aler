<script lang="ts">
    let { title, coverImage, status, rating, userStatus, userRating } =
        $props();
</script>

<div
    class="grid grid-cols-[3rem_8fr_1fr_1fr_1fr] gap-4 p-4 h-24 w-full items-center border-b border-gray-100"
>
    <img
        src={coverImage}
        alt={title}
        class="rounded-md shadow-sm shrink-0 h-16 w-12 object-cover"
    />

    <div class="truncate sm:wrap-break-word font-medium">{title}</div>

    <div class="text-right text-sm text-gray-600 truncate">{userStatus}</div>

    <div class="text-right text-sm text-gray-600 truncate">
        Global: {+rating / 10}
    </div>

    <div class="text-right text-sm text-gray-600 truncate">
        Yours: {userRating}
    </div>
</div>
