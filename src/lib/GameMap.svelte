<script lang="ts">
  import AspectRatio from "./AspectRatio.svelte"
  import {
    getCharacterPathTo,
    isInsideGameboard,
    removeFog,
    TILE_SIZE,
    tileIsFog,
  } from "./common"
  import CrtScreen from "./CrtScreen.svelte"
  import Cursor from "./Cursor.svelte"
  import Loading from "./Loading.svelte"
  import Player from "./Player.svelte"
  import { gameState } from "./state.svelte"
  import Vec2 from "./Vec2"
  import MapLayer from "./MapLayer.svelte"

  let freezePath = $state(false)
  let clientWidth = $state(0)
  let stageScale = $derived(clientWidth / 512)
  let cursorPosition = $state(gameState.currentPlayer.position)
  let cursorPath = $state<Vec2[]>([])

  $effect(() => {
    if (freezePath) return
    getCharacterPathTo(gameState.currentPlayer, cursorPosition).then((path) => {
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

    if (!movements[event.key]) {
      return
    }

    const newPosition = cursorPosition.add(movements[event.key])

    if (!isInsideGameboard(newPosition)) {
      return
    }

    if (tileIsFog(newPosition)) {
      return
    }

    cursorPosition = newPosition
  }

  async function walkToCursor(): Promise<void> {
    const path = await getCharacterPathTo(
      gameState.currentPlayer,
      cursorPosition,
    )
    if (!path?.length) {
      return
    }

    freezePath = true
    for (const step of path.slice(1)) {
      gameState.currentPlayer.position = step
      await waitTime(200)
      cursorPath = cursorPath.slice(1)
    }
    freezePath = false

    await removeFog(gameState.currentPlayer.position)
  }

  function waitTime(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
</script>

<svelte:window {onkeydown} />

<AspectRatio ratio={16 / 12}>
  <CrtScreen flickerOpacity={0.6} vhs={false}>
    <div class="game-map" bind:clientWidth>
      {#if !gameState.stage}
        <Loading />
      {:else}
        <div
          class="stage"
          style="transform: scale({stageScale});"
          style:--tile-size="{TILE_SIZE}px"
          style:--map-width={gameState.stage.mapWidth}
          style:--map-height={gameState.stage.mapHeight}
        >
          <div class="layers">
            {#each gameState.stage.layers as layer, index}
              <MapLayer
                {layer}
                zIndex={gameState.stage.layers.length - index}
              />
            {/each}
          </div>

          <div class="gameboard">
            <Cursor position={cursorPosition} />

            {#each cursorPath as step}
              <div
                class="step"
                style:left="{step.x * TILE_SIZE}px"
                style:top="{step.y * TILE_SIZE}px"
              ></div>
            {/each}

            {#each gameState.players as player}
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
  .gameboard {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
