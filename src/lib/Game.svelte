<script lang="ts">
  import CrtScreen from "./CrtScreen.svelte"
  import GameMap from "./GameMap.svelte"
  import { TILE_SIZE, VIEWPORT_SIZE } from "./helpers/common"
  import InventoryExchange from "./InventoryExchange.svelte"
  import MagicScroll from "./MagicScroll.svelte"
  import PlayersList from "./PlayersList.svelte"
  import { gameState } from "./state.svelte"

  let naturalHeight = TILE_SIZE * VIEWPORT_SIZE
  let naturalWidth = $derived((naturalHeight / 9) * 16)
  let gameWidth = $state(0)
  let scale = $derived(gameWidth / naturalWidth)
</script>

<div class="game" bind:clientWidth={gameWidth}>
  <CrtScreen vhs={false} flickerOpacity={0}>
    <div class="center">
      <div
        class="game-scaled"
        style:width="{naturalWidth}px"
        style:height="{naturalHeight}px"
        style:transform="scale({scale})"
      >
        <div class="left-space">
          <PlayersList side="left" />
        </div>
        <div class="screen-container">
          <GameMap />

          {#if gameState.openInventory && gameState.currentPlayer}
            <InventoryExchange
              leftInventory={gameState.openInventory}
              rightInventory={gameState.currentPlayer.actor}
            />
          {/if}

          {#if gameState.magicMenuOpen}
            <MagicScroll />
          {/if}
        </div>
        <div class="right-space">
          <PlayersList side="right" />
        </div>
      </div>
    </div>
  </CrtScreen>
</div>

<style>
  .game {
    width: 100%;
    aspect-ratio: 16 / 9;
  }
  .center {
    width: 100%;
    height: 100%;
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
    width: 0;
    flex-shrink: 0;
    flex-grow: 1;
  }
</style>
