<script lang="ts">
  import type { MapTileAtts, Tile } from "./types"
  import { gameState } from "./state.svelte"
  import { TILE_SIZE } from "./common"

  let {
    tile,
  }: {
    tile: Tile<MapTileAtts>
  } = $props()
</script>

<div
  class="tile"
  style:left="{tile.position.x * TILE_SIZE}px"
  style:top="{tile.position.y * TILE_SIZE}px"
  style:animation-delay="{tile.position.magnitude() * 40}ms"
>
  <img
    class="spritesheet"
    src={gameState.stage!.spritesheetUrl}
    style:left="{tile.sprite.x * -TILE_SIZE}px"
    style:top="{tile.sprite.y * -TILE_SIZE}px"
    alt=""
  />
</div>

<style>
  .tile {
    position: absolute;
    overflow: hidden;
    width: var(--tile-size);
    height: var(--tile-size);
    opacity: 0;
    animation-name: show;
    animation-duration: 3000ms;
    animation-fill-mode: forwards;
  }
  .spritesheet {
    position: absolute;
    image-rendering: pixelated;
  }
  @keyframes show {
    100% {
      opacity: 1;
    }
  }
</style>
