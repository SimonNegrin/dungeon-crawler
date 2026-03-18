<script lang="ts">
  import { loadStage } from "./common"

  let {
    name,
  }: {
    name: string
  } = $props()

  let stagePromise = $derived(loadStage(name))
  let spritesheet = $derived(`/${name}/spritesheet.png`)
</script>

{#await stagePromise then stage}
  <div
    class="stage"
    style:--tile-size="{stage.tileSize}px"
    style:--map-width={stage.mapWidth}
    style:--map-height={stage.mapHeight}
  >
    {#each stage.layers as layer, index}
      <div
        class="layer"
        data-name={layer.name}
        style:z-index={stage.layers.length - index}
      >
        {#each layer.tiles as tile}
          <div
            class="tile"
            style:left="{tile.x * stage.tileSize}px"
            style:top="{tile.y * stage.tileSize}px"
          >
            <img
              class="spritesheet"
              src={spritesheet}
              style:left="{tile.spriteX * -stage.tileSize}px"
              style:top="{tile.spriteY * -stage.tileSize}px"
              alt=""
            />
          </div>
        {/each}
      </div>
    {/each}
  </div>
{/await}

<style>
  .stage {
    position: relative;
    transform: scale(2.2);
    background-color: rgb(40, 40, 40);
    width: calc(var(--map-width) * var(--tile-size));
    height: calc(var(--map-height) * var(--tile-size));
  }
  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .tile {
    position: absolute;
    overflow: hidden;
    width: var(--tile-size);
    height: var(--tile-size);
  }
  .spritesheet {
    position: absolute;
    image-rendering: pixelated;
  }
</style>
