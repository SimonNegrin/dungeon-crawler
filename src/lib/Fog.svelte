<script lang="ts">
  import { fade, fly } from "svelte/transition"
  import { TILE_SIZE } from "./common"
  import type Vec2 from "./Vec2"
  import { gameState } from "./state.svelte"

  interface Star {
    x: number
    y: number
    opacity: number
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
        opacity: 0.4 + 0.6 * Math.random(),
      })
    }
    return stars
  }

  function top(position: Vec2): number {
    let top = position.y * TILE_SIZE
    if (isWallAt(position.up())) {
      top -= TILE_SIZE / 2
    }
    return top
  }

  function height(position: Vec2): number {
    let height = TILE_SIZE
    if (isWallAt(position.up())) {
      height += TILE_SIZE / 2
    }
    return height
  }

  function isWallAt(position: Vec2): boolean {
    if (!gameState.stage) {
      return false
    }
    return gameState.stage.layers.some((layer) => {
      return (
        layer.collider &&
        layer.tiles.some((tile) => {
          if (tile.attributes?.door) {
            return false
          }
          return tile.position.isEqual(position)
        })
      )
    })
  }
</script>

<div
  class="fog"
  out:fly={{ y: 20, delay: 500 * Math.random() }}
  style:left="{position.x * TILE_SIZE}px"
  style:top="{top(position)}px"
  style:height="{height(position)}px"
>
  {#each stars as star}
    <div
      class="star"
      style:left="{star.x * 100}%"
      style:top="{star.y * 100}%"
      style:opacity={star.opacity}
    ></div>
  {/each}
</div>

<style>
  .fog {
    position: absolute;
    width: var(--tile-size);
    background-color: #000000;
    opacity: 1;
  }
  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background-color: #fff;
    transform: translate(-50%, -50%);
  }
</style>
