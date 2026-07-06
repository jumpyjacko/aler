<script lang="ts">
    import { stopPropagation } from "svelte/legacy";

    let {
        title,
        coverImage,
        status,
        rating,
        userStatus,
        userRating,
        mmrRating,
        ratingDeviation,

        seriesType,
        malId,
        anilistId,
    } = $props();

    const malLink = $derived(
        malId
            ? "https://myanimelist.net/" +
                  seriesType.toLowerCase() +
                  "/" +
                  malId
            : undefined,
    );

    const anilistLink = $derived(
        anilistId
            ? "https://anilist.co/" + seriesType.toLowerCase() + "/" + anilistId
            : undefined,
    );
</script>

<div
    class="
        flex flex-row justify-center items-center w-full py-[1vh]
        md:flex-col md:items-center
    "
>
    <img
        src={coverImage}
        alt={title}
        class="rounded-md shadow-sm w-[30vw] h-[45vw] md:h-[50vh] md:w-[35vh] object-cover select-none"
        draggable="false"
    />

    <div class="w-60 md:w-[90%] p-4 text-left md:text-center">
        <div class="text-lg">{title}</div>
        <div class="text-sm">{userStatus}</div>
        <div class="text-text-faded text-sm">Global: {+rating / 10}</div>
        <div class="text-text-faded text-sm">Yours: {userRating}</div>
        <div class="text-text-faded text-sm text-">Rating: {mmrRating}</div>

        <div class="flex flex-row gap-4 items-center justify-center mt-2">
            {#if malLink}
                <a
                    onclick={(e) => e.stopPropagation()}
                    href={malLink}
                    target="_blank"
                    class="underline text-primary hover:text-primary-dimmed visited:text-purple-800 dark:visited:text-purple-400"
                    >MyAnimeList</a
                >
            {/if}
            {#if anilistLink}
                <a
                    onclick={(e) => e.stopPropagation()}
                    href={anilistLink}
                    target="_blank"
                    class="underline text-primary hover:text-primary-dimmed visited:text-purple-800 dark:visited:text-purple-400"
                    >AniList</a
                >
            {/if}
        </div>
    </div>
</div>
