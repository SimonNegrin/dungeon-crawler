<script lang="ts">
  import { TILE_SIZE, VIEWPORT_SIZE } from "./common"
  import GameMap from "./GameMap.svelte"
  import InventoryExchange from "./InventoryExchange.svelte"
  import { gameState } from "./state.svelte"

  let naturalHeight = TILE_SIZE * VIEWPORT_SIZE
  let naturalWidth = $derived((naturalHeight / 9) * 16)
  let gameWidth = $state(0)
  let scale = $derived(gameWidth / naturalWidth)
</script>

<div class="game" bind:clientWidth={gameWidth}>
  <div
    class="game-scaled"
    style:width="{naturalWidth}px"
    style:height="{naturalHeight}px"
    style:transform="scale({scale})"
  >
    <div class="left-space"></div>
    <div class="screen-container">
      <GameMap />

      {#if gameState.openInventory}
        <InventoryExchange
          leftInventory={gameState.openInventory}
          rightInventory={gameState.currentPlayer}
        />
      {/if}
    </div>
    <div class="right-space"></div>
  </div>
</div>

<style>
  .game {
    width: 100%;
    aspect-ratio: 16 / 9;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .game-scaled {
    display: flex;
  }
  .screen-container {
    position: relative;
    height: 100%;
    aspect-ratio: 1;
    flex-shrink: 0;
  }
  .left-space,
  .right-space {
    min-width: 0;
    flex-shrink: 1;
    flex-grow: 1;
  }
</style>
