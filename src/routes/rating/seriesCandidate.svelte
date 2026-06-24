<script lang="ts">
    let {
        title,
        coverImage,
        status,
        rating,
        userStatus,
        userRating,
        mmrRating,
        ratingDeviation,
    } = $props();
</script>

<div
    class="
        flex flex-row justify-center items-center w-full py-10
        md:flex-col md:items-center
    "
>
    <img
        src={coverImage}
        alt={title}
        class="rounded-md shadow-sm h-60 w-40 md:h-90 md:w-60 object-cover select-none"
        draggable="false"
    />

    <div class="w-60 md:w-[90%] p-4 text-left md:text-center">
        <div class="text-lg">{title}</div>
        <div class="text-sm">{userStatus}</div>
        <div class="text-gray-600 text-sm">Global: {+rating / 10}</div>
        <div class="text-gray-600 text-sm">Yours: {userRating}</div>
        <div class="text-gray-600 text-sm">Rating: {mmrRating}</div>
    </div>
</div>
