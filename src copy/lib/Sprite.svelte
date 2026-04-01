<script lang="ts" module>
  type SpriteAtts = {
    key: string
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
      return tile.attributes.key === spriteId
    })

    if (!tile) {
      throw new Error(`Sprite ID "${spriteId}" not found`)
    }

    return tile.sprite
  }
</script>

<script lang="ts">
  import { loadSpritesheet, TILE_SIZE } from "../../src/lib/constantsmport type { Spritesheet } from "./t../../src/lib/types
  import Ve../../src/lib/Vec2m "./Vec2"

  let {
    path,
    lookRight = false,
    scale = 1,
  }: {
    path: string
    lookRight?: boolean
    scale?: number
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

  function transformOrigin(spritePosition: Vec2): string {
    const x = spritePosition.x * TILE_SIZE + TILE_SIZE / 2
    return `${x}px center`
  }
</script>

<div class="sprite" style:transform="scale({scale})">
  <img
    src={spritesheet}
    style:left="{spritePosition.x * -TILE_SIZE}px"
    style:top="{spritePosition.y * -TILE_SIZE}px"
    style:transform-origin={transformOrigin(spritePosition)}
    class:look-right={lookRight}
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

    &.look-right {
      transform: scaleX(-1);
    }
  }
</style>
