<script lang="ts" module>
  import { isEthereal, loadSpritesheet } from "./common"
  import type { Character, Tile } from "./types"
  import WalkSound from "./WalkSound.svelte"

  type PlayerAtts = {
    name: string
  }

  const spritesheet = await loadSpritesheet<PlayerAtts>("Rogues")
</script>

<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  let {
    player,
  }: {
    player: Character
  } = $props()

  let canvas: HTMLCanvasElement
  let walkSound: WalkSound

  let lastPosition = player.position
  let tile = $derived(getRogueTile(player.name))
  let lookRight = $state(false)
  let ethereal = $derived(isEthereal(player))

  $effect(() => {
    if (player.position.x !== lastPosition.x) {
      lookRight = player.position.x > lastPosition.x
    }
    if (!lastPosition.isEqual(player.position)) {
      walkSound.play()
      lastPosition = player.position
    }
  })

  $effect(() => {
    const img = document.createElement("img") as HTMLImageElement
    img.src = spritesheet.spritesheetUrl

    img.onload = () => {
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(
        img,
        tile.sprite.x * spritesheet.tileSize,
        tile.sprite.y * spritesheet.tileSize,
        spritesheet.tileSize,
        spritesheet.tileSize,
        0,
        0,
        spritesheet.tileSize,
        spritesheet.tileSize,
      )
    }
  })

  function getRogueTile(name: string): Tile<PlayerAtts> {
    const layer = spritesheet.layers[0]
    const tile = layer.tiles.find((tile) => {
      return tile.attributes?.name === name
    })
    if (!tile) {
      throw new Error(`Rogue tile "${name}" not found`)
    }
    return tile
  }
</script>

<div
  class="rogue"
  style:width="{spritesheet.tileSize}px"
  style:height="{spritesheet.tileSize}px"
  style:left="{player.position.x * spritesheet.tileSize}px"
  style:top="{player.position.y * spritesheet.tileSize}px"
>
  <canvas
    bind:this={canvas}
    class="sprite"
    class:ethereal
    class:look-right={lookRight}
    width={spritesheet.tileSize}
    height={spritesheet.tileSize}
  ></canvas>
</div>

<WalkSound bind:this={walkSound} />

<style>
  .rogue {
    position: absolute;
    transition-duration: 200ms;
  }
  .sprite {
    image-rendering: pixelated;

    &.ethereal {
      filter: drop-shadow(0 0 1px white);
      opacity: 0.8;
    }

    &.look-right {
      transform: scaleX(-1);
    }
  }
</style>
