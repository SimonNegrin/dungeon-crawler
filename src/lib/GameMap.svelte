<script lang="ts">
  import AspectRatio from "./AspectRatio.svelte"
  import CrtScreen from "./CrtScreen.svelte"
  import Loading from "./Loading.svelte"
  import Player from "./Player.svelte"
  import { players, stage } from "./state"

  let clientWidth = $state(0)
  let stageScale = $derived(clientWidth / 512)
</script>

<AspectRatio ratio={16 / 12}>
  <CrtScreen>
    <div class="game-map" bind:clientWidth>
      {#if !$stage}
        <Loading />
      {:else}
        <div
          class="stage"
          style="transform: scale({stageScale});"
          style:--tile-size="{$stage.tileSize}px"
          style:--map-width={$stage.mapWidth}
          style:--map-height={$stage.mapHeight}
        >
          <div class="layers">
            {#each $stage.layers as layer, index}
              <div
                class="layer"
                data-name={layer.name}
                style:z-index={$stage.layers.length - index}
              >
                {#each layer.tiles as tile}
                  <div
                    class="tile"
                    style:left="{tile.x * $stage.tileSize}px"
                    style:top="{tile.y * $stage.tileSize}px"
                  >
                    <img
                      class="spritesheet"
                      src={$stage.spritesheetUrl}
                      style:left="{tile.spriteX * -$stage.tileSize}px"
                      style:top="{tile.spriteY * -$stage.tileSize}px"
                      alt=""
                    />
                  </div>
                {/each}
              </div>
            {/each}
          </div>

          <div class="gameboard">
            {#each $players as _, playerIndex}
              <Player {playerIndex} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </CrtScreen>
</AspectRatio>

<style>
  .game-map {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .stage {
    position: relative;
    overflow: hidden;
    width: calc(var(--map-width) * var(--tile-size));
    height: calc(var(--map-height) * var(--tile-size));
  }
  .layers {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
  .gameboard {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
