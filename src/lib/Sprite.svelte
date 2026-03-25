<script lang="ts" module>
  type SpriteAtts = {
    id: string
  }

  const spritesheets = new Map<string, Promise<Spritesheet<SpriteAtts>>>()

  async function getSpritePosition(spritePath: string): Promise<Vec2> {
    const [spritesheetId, spriteId] = spritePath.split("/")

    if (!spritesheets.has(spritesheetId)) {
      const promise = loadSpritesheet<SpriteAtts>(spritesheetId)
      spritesheets.set(spritesheetId, promise)
    }

    const spritesheet = await spritesheets.get(spritesheetId)!
    const tile = spritesheet.layers[0].tiles.find((tile) => {
      return tile.attributes.id === spriteId
    })

    if (!tile) {
      throw new Error(`Sprite ID "${spriteId}" not found`)
    }

    return tile.sprite
  }
</script>

<script lang="ts">
  import { loadSpritesheet, TILE_SIZE } from "./common"
  import type { Spritesheet } from "./types"
  import Vec2 from "./Vec2"

  let {
    path,
    lookRight = false,
  }: {
    path: string
    lookRight?: boolean
  } = $props()

  let spritesheet = $derived(spritesheetUrl(path))
  let spritePosition = $state(new Vec2(0, 0))

  $effect(() => {
    getSpritePosition(path).then((position) => {
      spritePosition = position
    })
  })

  function spritesheetUrl(path: string): string {
    const [spritesheetId] = path.split("/")
    return `/spritesheets/${spritesheetId}/spritesheet.png`
  }
</script>

<div class="sprite">
  <img
    src={spritesheet}
    style:left="{spritePosition.x * -TILE_SIZE}px"
    style:top="{spritePosition.y * -TILE_SIZE}px"
    alt=""
  />
</div>

<style>
  .sprite {
    position: relative;
    width: var(--tile-size);
    height: var(--tile-size);
    overflow: hidden;
    flex-shrink: 0;
  }
  img {
    position: absolute;
    image-rendering: pixelated;
  }
</style>
