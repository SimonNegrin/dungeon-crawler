<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import { walkSound } from "./audio"
  import { isEthereal, TILE_SIZE } from "./common"
  import Sprite from "./Sprite.svelte"
  import { gameState } from "./state.svelte"
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
  class="player"
  class:ethereal={isEthereal(player)}
  style:left="{player.position.x * TILE_SIZE}px"
  style:top="{player.position.y * TILE_SIZE}px"
>
  {#if gameState.currentPlayer === player}
    <div class="current-player"></div>
  {/if}

  <Sprite path={player.spritePath} {lookRight} />
</div>

<style>
  .player {
    position: absolute;
    z-index: 1;
    transition-duration: 200ms;
    width: var(--tile-size);
    height: var(--tile-size);

    &.ethereal {
      filter: drop-shadow(0 0 1px white);
      opacity: 0.8;
    }
  }

  .current-player {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px dotted yellow;
  }
</style>
