<script lang="ts">
  import AspectRatio from "./AspectRatio.svelte"
  import { canOccupyPosition, getCharacterPathTo } from "./common"
  import CrtScreen from "./CrtScreen.svelte"
  import Cursor from "./Cursor.svelte"
  import Loading from "./Loading.svelte"
  import Player from "./Player.svelte"
  import { playerIndex, getCurrentPlayer, players, stage } from "./state"
  import Vec2 from "./Vec2"

  let freezePath = $state(false)
  let clientWidth = $state(0)
  let stageScale = $derived(clientWidth / 512)
  let cursorPosition = $state($players[$playerIndex].position)
  let cursorPath = $state<Vec2[]>([])

  $effect(() => {
    if (freezePath) return
    getCharacterPathTo($players[$playerIndex], cursorPosition).then((path) => {
      if (!path) {
        cursorPath = []
        return
      }
      cursorPath = path.slice(1, -1)
    })
  })

  function onkeydown(event: KeyboardEvent): void {
    if (event.key === " ") {
      walkToCursor()
      return
    }

    const movements: Record<string, Vec2> = {
      ArrowRight: new Vec2(1, 0),
      ArrowLeft: new Vec2(-1, 0),
      ArrowDown: new Vec2(0, 1),
      ArrowUp: new Vec2(0, -1),
    }

    if (!movements[event.key]) return

    cursorPosition = cursorPosition.add(movements[event.key])
  }

  async function walkToCursor(): Promise<void> {
    const currentPlayer = getCurrentPlayer()
    if (!canOccupyPosition(currentPlayer, cursorPosition)) {
      return
    }

    const path = await getCharacterPathTo(currentPlayer, cursorPosition)
    if (!path) {
      return
    }

    freezePath = true
    for (const step of path.slice(1)) {
      $players[$playerIndex].position = step
      await waitTime(200)
      cursorPath = cursorPath.slice(1)
    }
    freezePath = false
  }

  function waitTime(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
</script>

<svelte:window {onkeydown} />

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
            <Cursor position={cursorPosition} />

            {#each cursorPath as step}
              <div
                class="step"
                style:left="{step.x * $stage.tileSize}px"
                style:top="{step.y * $stage.tileSize}px"
              ></div>
            {/each}

            {#each $players as player}
              <Player {player} />
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
  .step {
    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);

    &::before {
      content: "";
      display: block;
      width: 8px;
      height: 8px;
      background-color: yellow;
      position: absolute;
      top: calc(50% - 4px);
      left: calc(50% - 4px);
      border-radius: 100%;
    }
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
