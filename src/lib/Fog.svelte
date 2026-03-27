<script lang="ts">
  import { fly } from "svelte/transition"
  import { TILE_SIZE } from "./common"
  import type Vec2 from "./Vec2"
  import Coords from "./Coords.svelte"

  interface Star {
    x: number
    y: number
    opacity: number
    blinkTime: string
  }

  let {
    position,
  }: {
    position: Vec2
  } = $props()

  let stars = $state(createStars(5))

  function createStars(n = 5): Star[] {
    let stars: Star[] = []
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        opacity: 0.6 * Math.random(),
        blinkTime: `${1500 + 1500 * Math.random()}ms`,
      })
    }
    return stars
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fog"
  out:fly={{ y: 20 }}
  style:left="{position.x * TILE_SIZE}px"
  style:top="{position.y * TILE_SIZE}px"
>
  <Coords vec2={position} />
  <!-- {#each stars as star}
    <div
      class="star"
      style:left="{star.x * 100}%"
      style:top="{star.y * 100}%"
      style:--opacity={star.opacity}
      style:--blink-time={star.blinkTime}
    ></div>
  {/each} -->
</div>

<style>
  .fog {
    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);
    background-color: #000000;
    opacity: 1;
  }
  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background-color: #fff;
    transform: translate(-50%, -50%);
    animation-name: blink;
    animation-iteration-count: infinite;
    animation-duration: var(--blink-time);
    animation-direction: normal;
  }

  @keyframes blink {
    0% {
      opacity: calc(0.05 + var(--opacity));
    }
    50% {
      opacity: calc(0.4 + var(--opacity));
    }
    100% {
      opacity: calc(0.05 + var(--opacity));
    }
  }
</style>
