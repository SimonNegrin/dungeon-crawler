<script lang="ts">
  import { TILE_SIZE } from "../helpers/common"

  let {
    spritesheet,
    pos,
    invert = false,
    scale = 1,
  }: {
    spritesheet: string
    pos: number[]
    invert?: boolean
    scale?: number
  } = $props()
</script>

<div class="sprite" class:invert style:transform="scale({scale})">
  <img
    style:left="{pos[0] * -TILE_SIZE}px"
    style:top="{pos[1] * -TILE_SIZE}px"
    src={spritesheet}
    alt=""
  />
</div>

<style>
  .sprite {
    position: relative;
    width: var(--tile-size);
    height: var(--tile-size);
    overflow: hidden;

    &.invert {
      transform: scaleX(-1);
    }
  }
  img {
    position: absolute;
    image-rendering: pixelated;
  }
</style>
