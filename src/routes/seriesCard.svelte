<script lang="ts">
    let { title, coverImage, status, rating, userStatus, userRating } = $props();
</script>

<div class="p-4 w-48 flex flex-col">
    <img
        src={coverImage}
        alt={title}
        class="rounded-md shadow-sm"
    />

    <div>{title}</div>
    <div>{status}</div>
    <div>{rating}</div>
    <div>{userStatus}</div>
    <div>{userRating}</div>
</div>
