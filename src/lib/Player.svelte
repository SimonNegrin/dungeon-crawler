<script lang="ts" module>
  import {
    calcCharacterDistanceBetween,
    canWalkToPosition,
    isEthereal,
    loadSpritesheet,
  } from "./common"
  import { players } from "./state"
  import type { RogueTileAttributes, Tile } from "./types"
  import Vec2 from "./Vec2"
  import WalkSound from "./WalkSound.svelte"

  const roguesSpritesheet = await loadSpritesheet<RogueTileAttributes>("Rogues")
</script>

<script lang="ts">
  let {
    playerIndex,
  }: {
    playerIndex: number
  } = $props()

  let player = $derived($players[playerIndex])
  let tile = $derived(getRogueTile(player.name))
  let steps = $derived(player.steps)
  let walkSound: WalkSound
  let ethereal = $derived(isEthereal(player))

  function getRogueTile(name: string): Tile<RogueTileAttributes> {
    const layer = roguesSpritesheet.layers[0]
    const tile = layer.tiles.find((tile) => {
      return tile.attributes?.name === name
    })
    if (!tile) {
      throw new Error(`Rogue tile "${name}" not found`)
    }
    return tile
  }

  async function windowOnkeydown(event: KeyboardEvent): Promise<void> {
    event.preventDefault()

    const movements: Record<string, Vec2> = {
      ArrowRight: new Vec2(1, 0),
      ArrowLeft: new Vec2(-1, 0),
      ArrowDown: new Vec2(0, 1),
      ArrowUp: new Vec2(0, -1),
    }

    const movement = movements[event.key]
    if (!movement) return

    const position = player.position.add(movement)
    if (!canWalkToPosition(player, position)) return

    const distance = await calcCharacterDistanceBetween(
      player,
      player.origin,
      position,
    )
    if (distance === null || distance > player.steps) return

    steps = player.steps - distance
    player.position = position
    walkSound.play()
  }
</script>

<svelte:window onkeydown={windowOnkeydown} />

<div
  class="rogue"
  style:width="{roguesSpritesheet.tileSize}px"
  style:height="{roguesSpritesheet.tileSize}px"
  style:left="{player.position.x * roguesSpritesheet.tileSize}px"
  style:top="{player.position.y * roguesSpritesheet.tileSize}px"
>
  <div class="steps">{steps}</div>
  <div class="mask">
    <img
      class="sprite"
      class:ethereal
      src="/Rogues/spritesheet.png"
      style:left="{tile.spriteX * -roguesSpritesheet.tileSize}px"
      style:top="{tile.spriteY * -roguesSpritesheet.tileSize}px"
      alt=""
    />
  </div>
</div>

<WalkSound bind:this={walkSound} />

<style>
  .rogue {
    position: absolute;
    transition-duration: 200ms;
  }
  .steps {
    --size: 12px;
    position: absolute;
    bottom: calc(100% - 0px);
    left: calc(50% - var(--size) / 2);
    width: var(--size);
    height: var(--size);
    font-size: calc(var(--size) * 0.75);
    line-height: var(--size);
    text-align: center;
    border-radius: 100%;
    background-color: red;
    color: white;
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .sprite {
    position: absolute;
    image-rendering: pixelated;
  }
  .ethereal {
    filter: drop-shadow(0 0 1px white);
    opacity: 0.8;
  }
</style>
