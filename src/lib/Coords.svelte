<script lang="ts">
  import { debug } from "./state.svelte"
  import type Vec2 from "./Vec2"

  let {
    vec2,
  }: {
    vec2: Vec2
  } = $props()
</script>

{#if debug.showCoords}
  <div class="coords">{vec2.toString()}</div>
{/if}

<style>
  .coords {
    position: absolute;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif;
    top: 0;
    left: 0;
    z-index: 2;
    font-size: 6px;
    color: #fff;
    background-color: black;
  }
</style>
