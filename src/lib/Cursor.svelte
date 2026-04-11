<script lang="ts">
  import { isEthereal } from "./helpers/common"
  import { TURN_PLAYERS } from "./helpers/game"
  import { isWallAt } from "./helpers/stage"
  import { gameState } from "./state.svelte"
  import type Vec2 from "./Vec2"

  let invalidPosition = $derived(
    isTooFar(
      gameState.cursorPath,
      gameState.currentPlayer.currentStats.movement,
    ) || isWallAtPosition(gameState.cursorPosition),
  )

  function isTooFar(cursorPath: Vec2[], movement: number): boolean {
    return cursorPath.length - 1 > movement
  }

  function isWallAtPosition(cursorPosition: Vec2): boolean {
    // If the current player is ethereal it not matter if there is a wall
    if (isEthereal(gameState.currentPlayer)) {
      return false
    }
    return isWallAt(cursorPosition)
  }
</script>

{#if gameState.turn === TURN_PLAYERS}
  <div
    class="cursor"
    class:invalid-position={invalidPosition}
    style:--x={gameState.cursorPosition.x}
    style:--y={gameState.cursorPosition.y}
  ></div>
{/if}

<style>
  .cursor {
    position: absolute;
    z-index: 4;
    width: var(--tile-size);
    height: var(--tile-size);
    left: calc(var(--tile-size) * var(--x));
    top: calc(var(--tile-size) * var(--y));
    border: 2px dotted #1dff09;
    transition-duration: 100ms;

    &.invalid-position {
      border-color: red;
    }
  }
</style>
