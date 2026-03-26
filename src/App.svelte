<script lang="ts">
  import AspectRatio from "./lib/AspectRatio.svelte"
  import { loadStage, gameState } from "./lib/state.svelte"
  import Landing from "./lib/Landing.svelte"
  import GameMap from "./lib/GameMap.svelte"
  import { nextPlayer, TILE_SIZE } from "./lib/common"

  function onStart(): void {
    loadStage("stage_2")
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return
    if (event.key === "n") {
      nextPlayer()
    }
  }
</script>

<svelte:window {onkeydown} />

<main style:--tile-size="{TILE_SIZE}px">
  <AspectRatio ratio={16 / 9}>
    {#if gameState.stage}
      <div class="game-container">
        <div class="left-space"></div>
        <div class="screen-container">
          <GameMap />
        </div>
        <div class="right-space"></div>
        <!-- <div class="game-info">
          <CurrentPlayer />
        </div> -->
      </div>
    {:else}
      <Landing onclick={onStart} />
    {/if}
  </AspectRatio>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--main-background-color);
  }
  .game-container {
    width: 100%;
    height: 100%;
    display: flex;
  }
  .screen-container {
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
