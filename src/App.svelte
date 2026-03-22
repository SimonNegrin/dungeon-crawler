<script lang="ts">
  import AspectRatio from "./lib/AspectRatio.svelte"
  import { loadStage, gameState } from "./lib/state.svelte"
  import Landing from "./lib/Landing.svelte"
  import GameMap from "./lib/GameMap.svelte"

  function onStart(): void {
    loadStage("Stage_1")
  }
</script>

<main>
  <AspectRatio ratio={16 / 9}>
    {#if gameState.stage}
      <div class="game-container">
        <div class="screen-container">
          <GameMap />
        </div>
        <div class="game-info"></div>
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
    padding: 25px;
    gap: 24px;
  }
  .screen-container {
    aspect-ratio: 16/12;
    flex-shrink: 0;
  }
  .game-info {
    min-width: 0;
    flex-shrink: 1;
    flex-grow: 1;
  }
</style>
