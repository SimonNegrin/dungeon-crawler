<script lang="ts">
  import spritesheet from "../assets/spritesheets/tiles/spritesheet.png"
  import map from "../assets/spritesheets/tiles/map.json"
  import { TILE_SIZE } from "./constants"
  import type { Position } from "./types"

  export type TileName = keyof typeof map

  let {
    position,
    name,
  }: {
    position: Position
    name: TileName
  } = $props()

  let sprite = $derived(map[name])
</script>

<div
  class="tile"
  style:left="{position.x * TILE_SIZE}px"
  style:top="{position.y * TILE_SIZE}px"
>
  {sprite}
  <img
    src={spritesheet}
    style:left="{sprite[1] * -TILE_SIZE}px"
    style:top="{sprite[0] * -TILE_SIZE}px"
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
  img {
    position: absolute;
    image-rendering: pixelated;
  }
</style>
