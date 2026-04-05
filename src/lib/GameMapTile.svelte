<script lang="ts">
  import type { Tile } from "./types"
  import { gameState } from "./state.svelte"
  import { TILE_SIZE } from "./common"
  import Coords from "./Coords.svelte"

  let {
    tile,
  }: {
    tile: Tile
  } = $props()
</script>

<div
  class="tile"
  style:left="{tile.position.x * TILE_SIZE}px"
  style:top="{tile.position.y * TILE_SIZE}px"
>
  <Coords vec2={tile.position} />
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
  @keyframes show {
    100% {
      opacity: 1;
    }
  }
</style>
