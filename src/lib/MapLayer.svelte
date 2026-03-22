<script lang="ts">
  import type { Layer, MapTileAttributes } from "./types"
  import Fog from "./Fog.svelte"
  import MapTile from "./MapTile.svelte"

  let {
    layer,
    zIndex,
  }: {
    layer: Layer<MapTileAttributes>
    zIndex: number
  } = $props()
</script>

<div class="layer" data-name={layer.name} style:z-index={zIndex}>
  {#each layer.tiles as tile}
    {#if layer.name.startsWith("fog")}
      <Fog position={tile.position} />
    {:else}
      <MapTile {tile} />
    {/if}
  {/each}
</div>

<style>
  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
