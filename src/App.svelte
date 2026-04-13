<script lang="ts">
  import AspectRatio from "./lib/AspectRatio.svelte"
  import { loadStage, gameState } from "./lib/state.svelte"
  import Landing from "./lib/Landing.svelte"
  import Game from "./lib/Game.svelte"
  import { nextPlayer } from "./lib/helpers/game"
  import { TILE_SIZE, VIEWPORT_SIZE } from "./lib/helpers/common"
  import ProjectileMagicFireball from "./lib/ProjectileMagicFireball.svelte"

  async function onStart(): Promise<void> {
    await loadStage("stage_2")
  }

  function onkeydown(event: KeyboardEvent) {
    if (gameState.ignoreInput || event.defaultPrevented) return
    if (event.key === "n") {
      nextPlayer()
    }
  }
</script>

<svelte:window {onkeydown} />

<main style:--tile-size="{TILE_SIZE}px" style:--viewport-size={VIEWPORT_SIZE}>
  <AspectRatio ratio={16 / 9}>
    {#if gameState.stage}
      <Game />
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
    overflow: hidden;
    justify-content: center;
    align-items: center;
    background-color: var(--main-background-color);
  }
</style>
