<script lang="ts">
  import AspectRatio from "./lib/AspectRatio.svelte"
  import { gameState } from "../src/lib/state.svelte"
  import Landing from "./lib/Landing.svelte"
  import { clearFogAt, nextPlayer, TILE_SIZE } from "./lib/common"
  import Game from "./lib/Game.svelte"
  import { loadStage } from "./lib/stage"

  async function onStart(): Promise<void> {
    await loadStage("stage_2")
    gameState.players.forEach((player) => {
      clearFogAt(player.position)
    })
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
