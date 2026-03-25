<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import { walkSound } from "./audio"
  import { isEthereal, TILE_SIZE } from "./common"
  import Sprite from "./Sprite.svelte"
  import type { Character } from "./types"

  let {
    player,
  }: {
    player: Character
  } = $props()

  let lastPosition = player.position
  let lookRight = $state(false)

  $effect(() => {
    if (player.position.x !== lastPosition.x) {
      lookRight = player.position.x > lastPosition.x
    }
    if (!lastPosition.isEqual(player.position)) {
      walkSound()
      lastPosition = player.position
    }
  })
</script>

<div
  class="rogue"
  class:ethereal={isEthereal(player)}
  style:left="{player.position.x * TILE_SIZE}px"
  style:top="{player.position.y * TILE_SIZE}px"
>
  <Sprite path={player.spritePath} {lookRight} />
</div>

<style>
  .rogue {
    position: absolute;
    transition-duration: 200ms;
    width: var(--tile-size);
    height: var(--tile-size);

    &.ethereal {
      filter: drop-shadow(0 0 1px white);
      opacity: 0.8;
    }
  }
</style>
