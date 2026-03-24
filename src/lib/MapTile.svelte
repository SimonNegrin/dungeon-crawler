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
  }
  .spritesheet {
    position: absolute;
    image-rendering: pixelated;
  }
</style>
