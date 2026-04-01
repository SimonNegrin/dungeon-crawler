<script lang="ts">
  import Fog from "./Fog.svelte"
  import { gameState } from "./state.svelte"
</script>

<div class="fog-layer">
  {#each gameState.fog as position (position.toString())}
    <Fog {position} />
  {/each}
</div>

<style>
  .fog-layer {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
