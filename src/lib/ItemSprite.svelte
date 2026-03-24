<script lang="ts" module>
  import { loadSpritesheet, TILE_SIZE } from "./common"
  import type Vec2 from "./Vec2"

  const spritesheet = await loadSpritesheet<{ id: string }>("items")
  const positions = new Map<string, Vec2>(
    spritesheet.layers[0].tiles.map((tile) => {
      return [tile.attributes.id, tile.sprite]
    }),
  )
</script>

<script lang="ts">
  let {
    id,
  }: {
    id: string
  } = $props()

  let position = $derived(getPosition(id))

  function getPosition(id: string): Vec2 {
    const position = positions.get(id)
    if (!position) {
      throw new Error(`Item sprite not found: ${id}`)
    }
    return position
  }
</script>

<div class="item-sprite">
  <img
    src="/items/spritesheet.png"
    style:left="{position.x * -TILE_SIZE}px"
    style:top="{position.y * -TILE_SIZE}px"
    class="spritesheet"
    alt=""
  />
</div>

<style>
  .item-sprite {
    position: relative;
    width: var(--tile-size);
    height: var(--tile-size);
    flex-shrink: 0;
    overflow: hidden;
  }
  .spritesheet {
    position: absolute;
    image-rendering: pixelated;
  }
</style>
