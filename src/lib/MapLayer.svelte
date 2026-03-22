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

  let fogLayer = $derived(layer.name.startsWith("fog"))
</script>

<div class="layer" data-name={layer.name} style:z-index={zIndex}>
  {#if fogLayer}
    {#each layer.tiles as tile (tile.position.toString())}
      <Fog position={tile.position} />
    {/each}
  {:else}
    {#each layer.tiles as tile (tile.position.toString())}
      <MapTile {tile} />
    {/each}
  {/if}
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
