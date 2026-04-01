<script lang="ts" module>
  import spritesheet from "../assets/spritesheets/items/spritesheet.png"
  import map from "../assets/spritesheets/items/map.json"

  export type ItemName = keyof typeof map
</script>

<script lang="ts">
  import { TILE_SIZE } from "./constants"

  let {
    name,
  }: {
    name: ItemName
  } = $props()

  let sprite = $derived(map[name])
</script>

<div class="tile">
  <img
    src={spritesheet}
    style:left="{sprite[0] * -TILE_SIZE}px"
    style:top="{sprite[1] * TILE_SIZE}px"
    alt=""
  />
</div>

<style>
  .tile {
    width: var(--tile-size);
    height: var(--tile-size);
    overflow: hidden;
  }
  img {
    position: absolute;
    image-rendering: pixelated;
  }
</style>
