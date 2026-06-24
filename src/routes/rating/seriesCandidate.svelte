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
        class="rounded-md shadow-sm h-60 w-40 md:h-90 md:w-60 object-cover"
    />

    <div class="w-60 md:w-[90%] p-4">
        <div>{title}</div>
        <div>{userStatus}</div>
        <div>Global: {+rating / 10}</div>
        <div>Yours: {userRating}</div>
        <div>Rating: {mmrRating}</div>
    </div>
</div>
