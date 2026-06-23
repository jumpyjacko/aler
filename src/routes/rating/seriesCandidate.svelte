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

<img
    src={coverImage}
    alt={title}
    class="rounded-md shadow-sm h-90 w-60 object-cover"
/>

<div>{title}</div>
<div>{userStatus}</div>
<div>Global: {+rating / 10}</div>
<div>Yours: {userRating}</div>
<div>Rating: {mmrRating}</div>
<div>Rating deviation: {ratingDeviation}</div>
