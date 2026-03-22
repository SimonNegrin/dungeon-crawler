<script lang="ts">
  import { fade } from "svelte/transition"
  import { TILE_SIZE } from "./common"
  import type Vec2 from "./Vec2"
  import { gameState } from "./state.svelte"

  let {
    position,
  }: {
    position: Vec2
  } = $props()

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
          return tile.position.isSame(position)
        })
      )
    })
  }
</script>

<div
  class="fog"
  out:fade={{ delay: 500 * Math.random() }}
  style:left="{position.x * TILE_SIZE}px"
  style:top="{top(position)}px"
  style:height="{height(position)}px"
></div>

<style>
  .fog {
    position: absolute;
    width: var(--tile-size);
    background-color: #000000;
    opacity: 1;
    background-image: linear-gradient(135deg, #414141 25%, transparent 25%),
      linear-gradient(225deg, #414141 25%, transparent 25%),
      linear-gradient(45deg, #414141 25%, transparent 25%),
      linear-gradient(315deg, #414141 25%, #000000 25%);
    background-position:
      5px 0,
      5px 0,
      0 0,
      0 0;
    background-size: 11px 11px;
    background-repeat: repeat;
  }
</style>
