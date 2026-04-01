<script lang="ts">
  import { gameState } from "./state.svelte"
  import type Vec2 from "./Vec2"

  let tooFar = $derived(
    isTooFar(gameState.cursorPath, gameState.initiativeLeft),
  )

  function isTooFar(cursorPath: Vec2[], initiativeLeft: number): boolean {
    return cursorPath.length - 1 > initiativeLeft
  }
</script>

<div
  class="cursor"
  class:too-far={tooFar}
  style:--x={gameState.cursorPosition.x}
  style:--y={gameState.cursorPosition.y}
></div>

<style>
  .cursor {
    position: absolute;
    z-index: 2;
    width: var(--tile-size);
    height: var(--tile-size);
    left: calc(var(--tile-size) * var(--x));
    top: calc(var(--tile-size) * var(--y));
    border: 2px dotted #1dff09;
    transition-duration: 100ms;

    &.too-far {
      border-color: red;
    }
  }
</style>
