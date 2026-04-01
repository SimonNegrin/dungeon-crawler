<script lang="ts">
  import AspectRatio from "./lib/AspectRatio.svelte"
  import { TILE_SIZE } from "./lib/constants"
  import Game from "./lib/Game.svelte"
  import Landing from "./lib/Landing.svelte"
  import { gameState } from "./lib/state.svelte"

  function onStart(): void {}
</script>

<svelte:window {onkeydown} />

<main style:--tile-size="{TILE_SIZE}px">
  <AspectRatio ratio={16 / 9}>
    <Game />
    <!-- {#if gameState.stage}
      <Game />
    {:else}
      <Landing onclick={onStart} />
    {/if} -->
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
